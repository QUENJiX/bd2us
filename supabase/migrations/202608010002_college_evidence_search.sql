-- Structured college evidence, explicit ranking categories, and name-first search.
alter table public.colleges
  add column if not exists aliases text[] not null default '{}',
  add column if not exists ranking_category text not null default 'other',
  add column if not exists research_highlight_override text,
  add column if not exists official_review_status text not null default 'unreviewed',
  add column if not exists official_reviewed_at date;

alter table public.colleges drop constraint if exists colleges_ranking_category_check;
alter table public.colleges add constraint colleges_ranking_category_check
  check (ranking_category in ('university', 'liberal-arts-college', 'other'));
alter table public.colleges drop constraint if exists colleges_official_review_status_check;
alter table public.colleges add constraint colleges_official_review_status_check
  check (official_review_status in ('unreviewed', 'reviewed', 'needs_follow_up'));

alter table public.college_facts
  add column if not exists fact_status text not null default 'unreviewed',
  add column if not exists source_id uuid references public.college_sources(id) on delete set null,
  add column if not exists data_year text,
  add column if not exists cycle text,
  add column if not exists raw_value jsonb,
  add column if not exists calculation_method text;

alter table public.college_facts drop constraint if exists college_facts_fact_status_check;
alter table public.college_facts add constraint college_facts_fact_status_check
  check (fact_status in ('reported', 'calculated', 'not_published', 'unreviewed'));

alter table public.college_sources
  add column if not exists source_scope text not null default 'official',
  add column if not exists data_year text,
  add column if not exists cycle text;

create index if not exists colleges_aliases_gin_idx on public.colleges using gin(aliases);
create index if not exists colleges_ranking_category_idx on public.colleges(ranking_category);
create index if not exists college_facts_college_status_idx on public.college_facts(college_id, status, fact_key);
create unique index if not exists college_sources_college_url_idx on public.college_sources(college_id, url);

comment on column public.colleges.ranking_category is 'Explicit sorting group. University and liberal-arts ranks are never compared directly.';
comment on column public.colleges.official_review_status is 'Outcome of the college-specific official-source review, including reviewed records where a fact is not published.';
comment on column public.college_facts.fact_status is 'Evidence status: reported, BD2US calculated, not published after review, or unreviewed.';
comment on column public.college_facts.calculation_method is 'Required explanation for calculated facts, such as admitted divided by applicants.';

grant select on table public.colleges, public.college_facts, public.college_sources to anon, authenticated;

create or replace function public.search_public_content(
  search_query text,
  search_types text[] default null,
  result_limit integer default 10,
  result_offset integer default 0
)
returns table(content_type text, title text, summary text, href text, rank real)
language sql stable security invoker
as $$
  with input as (
    select lower(trim(regexp_replace(search_query, '[^[:alnum:]]+', ' ', 'g'))) as q
  ),
  guide_matches as (
    select content_type, title, summary, '/' || content_type || '/' || slug as href,
      (
        ts_rank_cd(
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(array_to_string(aliases, ' '), '')), 'A') ||
          setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(body::text, '')), 'C'),
          websearch_to_tsquery('english', search_query)
        ) * 4 +
        greatest(similarity(lower(title), lower(search_query)) * 2, similarity(lower(array_to_string(aliases, ' ')), lower(search_query))) +
        case when lower(title) = lower(search_query) then 90 when lower(title) like lower(search_query) || '%' then 52 when lower(title) like '%' || lower(search_query) || '%' then 32 else 0 end
      )::real as rank
    from public.content_entries
    where status = 'published' and (search_types is null or content_type = any(search_types))
  ),
  task_matches as (
    select 'tasks'::text, title, description, '/roadmap#' || id,
      (similarity(lower(title), lower(search_query)) * 10 + case when lower(title) = lower(search_query) then 90 when lower(title) like lower(search_query) || '%' then 52 when lower(title) like '%' || lower(search_query) || '%' then 32 when lower(description) like '%' || lower(search_query) || '%' then 10 else 0 end)::real
    from public.roadmap_tasks
    where status = 'published' and (search_types is null or 'tasks' = any(search_types))
  ),
  college_matches as (
    select 'colleges'::text, c.name, c.summary, '/colleges/' || c.slug,
      (case
        when lower(c.name) = i.q then 1000
        when exists (select 1 from unnest(c.aliases || array[c.short_name]) alias where lower(alias) = i.q) then 950
        when lower(c.name) like i.q || '%' then 850
        when lower(c.name) like '%' || i.q || '%' then 750
        when exists (select 1 from unnest(c.aliases || array[c.short_name]) alias where lower(alias) like i.q || '%') then 650
        when lower(concat_ws(' ', c.city, c.state, c.location, c.region)) like '%' || i.q || '%' then 350
        when lower(concat_ws(' ', c.summary, c.special_note, c.research_highlight_override)) like '%' || i.q || '%' then 150
        else greatest(similarity(lower(c.name), i.q), (select coalesce(max(similarity(lower(alias), i.q)), 0) from unnest(c.aliases || array[c.short_name]) alias)) * 100
      end)::real
    from public.colleges c cross join input i
    where c.status = 'published' and (search_types is null or 'colleges' = any(search_types))
  )
  select * from (
    select * from guide_matches union all select * from task_matches union all select * from college_matches
  ) results
  where rank > 8
  order by rank desc, title asc
  limit least(greatest(result_limit, 1), 30)
  offset greatest(result_offset, 0);
$$;
