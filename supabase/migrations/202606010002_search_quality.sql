create or replace function public.search_public_content(
  search_query text,
  search_types text[] default null,
  result_limit integer default 10,
  result_offset integer default 0
)
returns table(content_type text, title text, summary text, href text, rank real)
language sql stable security invoker
as $$
  with guide_matches as (
    select content_type, title, summary, '/' || content_type || '/' || slug as href,
      (
        ts_rank_cd(
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(array_to_string(aliases, ' '), '')), 'A') ||
          setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(body::text, '')), 'C'),
          websearch_to_tsquery('english', search_query)
        ) * 4 +
        greatest(
          similarity(lower(title), lower(search_query)) * 2,
          similarity(lower(array_to_string(aliases, ' ')), lower(search_query))
        ) +
        case
          when lower(title) = lower(search_query) then 5
          when lower(title) like lower(search_query) || '%' then 3
          when lower(title) like '%' || lower(search_query) || '%' then 1.5
          else 0
        end
      )::real as rank
    from public.content_entries
    where status = 'published'
      and (search_types is null or content_type = any(search_types))
  ),
  task_matches as (
    select 'tasks'::text, title, description, '/roadmap#' || id,
      (
        similarity(lower(title), lower(search_query)) * 2 +
        case
          when lower(title) = lower(search_query) then 5
          when lower(title) like lower(search_query) || '%' then 3
          when lower(title) like '%' || lower(search_query) || '%' then 1.5
          when lower(description) like '%' || lower(search_query) || '%' then 0.75
          else 0
        end
      )::real
    from public.roadmap_tasks
    where status = 'published'
      and (search_types is null or 'tasks' = any(search_types))
  ),
  college_matches as (
    select 'colleges'::text, name, summary, '/colleges/' || slug,
      (
        greatest(similarity(lower(name), lower(search_query)), similarity(lower(short_name), lower(search_query))) * 2 +
        case
          when lower(name) = lower(search_query) or lower(short_name) = lower(search_query) then 5
          when lower(name) like lower(search_query) || '%' or lower(short_name) like lower(search_query) || '%' then 3
          when lower(name) like '%' || lower(search_query) || '%' or lower(summary) like '%' || lower(search_query) || '%' then 1.5
          else 0
        end
      )::real
    from public.colleges
    where status = 'published'
      and (search_types is null or 'colleges' = any(search_types))
  )
  select * from (
    select * from guide_matches
    union all
    select * from task_matches
    union all
    select * from college_matches
  ) results
  where rank > 0.08
  order by rank desc, title asc
  limit least(greatest(result_limit, 1), 30)
  offset greatest(result_offset, 0);
$$;
