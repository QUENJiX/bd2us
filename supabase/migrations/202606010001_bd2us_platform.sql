create extension if not exists pg_trgm;

create type public.review_status as enum ('draft', 'in_review', 'published', 'stale');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  curriculum text,
  current_year text,
  target_intake text,
  aid_band text,
  testing_status text,
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roadmap_templates (
  id text primary key,
  title text not null,
  summary text not null,
  stage_order integer not null,
  status public.review_status not null default 'draft'
);

create table public.roadmap_tasks (
  id text primary key,
  stage_id text not null references public.roadmap_templates(id) on delete cascade,
  title text not null,
  description text not null,
  due_hint text not null,
  guide_slug text not null,
  priority text not null default 'Core',
  status public.review_status not null default 'draft'
);

create table public.user_task_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null references public.roadmap_tasks(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

create table public.user_deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_at timestamptz not null,
  source_url text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.content_entries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  content_type text not null,
  locale text not null default 'en',
  title text not null,
  summary text not null,
  body jsonb not null default '[]',
  aliases text[] not null default '{}',
  status public.review_status not null default 'draft',
  last_verified_at date,
  next_review_at date,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  content_entry_id uuid not null references public.content_entries(id) on delete cascade,
  label text not null,
  url text not null,
  last_verified_at date not null,
  editor_notes text
);

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_entry_id uuid not null references public.content_entries(id) on delete cascade,
  editor_id uuid references auth.users(id),
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table public.colleges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_name text not null,
  location text not null,
  institution_type text not null,
  aid_policy text not null,
  meets_full_need boolean not null default false,
  merit_aid boolean not null default false,
  summary text not null,
  status public.review_status not null default 'draft',
  last_verified_at date,
  next_review_at date,
  updated_at timestamptz not null default now()
);

create table public.college_facts (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  fact_key text not null,
  fact_value jsonb not null,
  status public.review_status not null default 'draft',
  last_verified_at date not null,
  unique (college_id, fact_key)
);

create table public.college_sources (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  label text not null,
  url text not null,
  last_verified_at date not null
);

create table public.college_deadlines (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  deadline_type text not null,
  due_at timestamptz,
  cycle text not null,
  source_url text not null,
  last_verified_at date not null
);

create table public.college_tags (
  college_id uuid not null references public.colleges(id) on delete cascade,
  tag text not null,
  primary key (college_id, tag)
);

create table public.saved_colleges (
  user_id uuid not null references auth.users(id) on delete cascade,
  college_id uuid not null references public.colleges(id) on delete cascade,
  bucket text not null default 'researching',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, college_id)
);

create table public.success_stories (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  story jsonb not null,
  consent_recorded_at timestamptz,
  status public.review_status not null default 'draft',
  published_at timestamptz
);

create table public.feedback_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.search_queries (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  result_count integer not null,
  created_at timestamptz not null default now()
);

create index profiles_id_idx on public.profiles(id);
create index user_task_progress_user_idx on public.user_task_progress(user_id);
create index user_deadlines_user_idx on public.user_deadlines(user_id);
create index saved_colleges_user_idx on public.saved_colleges(user_id);
create index content_entries_search_idx on public.content_entries using gin (
  (setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
   setweight(to_tsvector('english', coalesce(array_to_string(aliases, ' '), '')), 'A') ||
   setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
   setweight(to_tsvector('english', coalesce(body::text, '')), 'C'))
);
create index content_entries_title_trgm_idx on public.content_entries using gin (title gin_trgm_ops);
create index colleges_name_trgm_idx on public.colleges using gin (name gin_trgm_ops);

alter table public.profiles enable row level security;
alter table public.roadmap_templates enable row level security;
alter table public.roadmap_tasks enable row level security;
alter table public.user_task_progress enable row level security;
alter table public.user_deadlines enable row level security;
alter table public.content_entries enable row level security;
alter table public.content_sources enable row level security;
alter table public.content_versions enable row level security;
alter table public.colleges enable row level security;
alter table public.college_facts enable row level security;
alter table public.college_sources enable row level security;
alter table public.college_deadlines enable row level security;
alter table public.college_tags enable row level security;
alter table public.saved_colleges enable row level security;
alter table public.success_stories enable row level security;
alter table public.feedback_messages enable row level security;
alter table public.audit_log enable row level security;
alter table public.search_queries enable row level security;

create policy "public roadmap templates" on public.roadmap_templates for select to anon, authenticated using (status = 'published');
create policy "public roadmap tasks" on public.roadmap_tasks for select to anon, authenticated using (status = 'published');
create policy "public content" on public.content_entries for select to anon, authenticated using (status = 'published');
create policy "public content sources" on public.content_sources for select to anon, authenticated using (
  exists (select 1 from public.content_entries where content_entries.id = content_entry_id and status = 'published')
);
create policy "public colleges" on public.colleges for select to anon, authenticated using (status = 'published');
create policy "public college facts" on public.college_facts for select to anon, authenticated using (status = 'published');
create policy "public college sources" on public.college_sources for select to anon, authenticated using (
  exists (select 1 from public.colleges where colleges.id = college_id and status = 'published')
);
create policy "public college deadlines" on public.college_deadlines for select to anon, authenticated using (
  exists (select 1 from public.colleges where colleges.id = college_id and status = 'published')
);
create policy "public college tags" on public.college_tags for select to anon, authenticated using (
  exists (select 1 from public.colleges where colleges.id = college_id and status = 'published')
);
create policy "public verified stories" on public.success_stories for select to anon, authenticated using (
  status = 'published' and consent_recorded_at is not null
);

create policy "own profile" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own progress" on public.user_task_progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own deadlines" on public.user_deadlines for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own saved colleges" on public.saved_colleges for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.has_editor_role(allowed_roles text[] default array['admin', 'editor', 'reviewer'])
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role') = any(allowed_roles), false);
$$;

create policy "editor content entries read" on public.content_entries for select to authenticated using (public.has_editor_role());
create policy "publisher content entries write" on public.content_entries for all to authenticated using (public.has_editor_role(array['admin', 'editor'])) with check (public.has_editor_role(array['admin', 'editor']));
create policy "editor content sources" on public.content_sources for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());
create policy "editor content versions" on public.content_versions for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());
create policy "editor colleges read" on public.colleges for select to authenticated using (public.has_editor_role());
create policy "publisher colleges write" on public.colleges for all to authenticated using (public.has_editor_role(array['admin', 'editor'])) with check (public.has_editor_role(array['admin', 'editor']));
create policy "editor college facts read" on public.college_facts for select to authenticated using (public.has_editor_role());
create policy "publisher college facts write" on public.college_facts for all to authenticated using (public.has_editor_role(array['admin', 'editor'])) with check (public.has_editor_role(array['admin', 'editor']));
create policy "editor college sources" on public.college_sources for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());
create policy "editor college deadlines" on public.college_deadlines for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());
create policy "editor college tags" on public.college_tags for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());
create policy "editor roadmap templates read" on public.roadmap_templates for select to authenticated using (public.has_editor_role());
create policy "publisher roadmap templates write" on public.roadmap_templates for all to authenticated using (public.has_editor_role(array['admin', 'editor'])) with check (public.has_editor_role(array['admin', 'editor']));
create policy "editor roadmap tasks read" on public.roadmap_tasks for select to authenticated using (public.has_editor_role());
create policy "publisher roadmap tasks write" on public.roadmap_tasks for all to authenticated using (public.has_editor_role(array['admin', 'editor'])) with check (public.has_editor_role(array['admin', 'editor']));
create policy "editor success stories read" on public.success_stories for select to authenticated using (public.has_editor_role());
create policy "publisher success stories write" on public.success_stories for all to authenticated using (public.has_editor_role(array['admin', 'editor'])) with check (public.has_editor_role(array['admin', 'editor']));
create policy "admin audit log" on public.audit_log for select to authenticated using (public.has_editor_role(array['admin']));

insert into public.roadmap_templates (id, title, summary, stage_order, status) values
  ('orientation', 'Get oriented', 'Start with the full map and a realistic family budget.', 1, 'published'),
  ('timeline', 'Set your timeline', 'Work backward from your target intake and school calendar.', 2, 'published'),
  ('research', 'Research colleges', 'Build a source-backed list around affordability and fit.', 3, 'published'),
  ('academics', 'Prepare academics', 'Coordinate transcripts, context, and recommendations.', 4, 'published'),
  ('testing', 'Plan testing', 'Choose useful tests and verify changing policies.', 5, 'published'),
  ('profile', 'Shape your profile', 'Describe sustained contribution with clarity.', 6, 'published'),
  ('essays', 'Write your story', 'Draft and revise essays that sound like you.', 7, 'published'),
  ('applications', 'Submit carefully', 'Control every platform, form, and confirmation.', 8, 'published'),
  ('aid', 'Handle financial aid', 'Prepare documents and compare real affordability.', 9, 'published'),
  ('decisions', 'Compare decisions', 'Respond to outcomes with a calm, sustainable plan.', 10, 'published'),
  ('visa', 'Complete visa steps', 'Move from enrollment to a prepared interview.', 11, 'published'),
  ('arrival', 'Arrive ready', 'Prepare travel and your first practical week.', 12, 'published')
on conflict (id) do nothing;

insert into public.roadmap_tasks (id, stage_id, title, description, due_hint, guide_slug, priority, status) values
  ('orient-costs', 'orientation', 'Understand your cost ceiling', 'Discuss a sustainable annual contribution range with your family.', 'Before serious college research', 'orientation', 'Core', 'published'),
  ('orient-path', 'orientation', 'Map the full journey', 'Review the stages from research through arrival and identify your current stage.', 'This week', 'orientation', 'Core', 'published'),
  ('timeline-intake', 'timeline', 'Choose a target intake', 'Select the August intake you are planning for and work backward from it.', 'As early as possible', 'timeline', 'Core', 'published'),
  ('timeline-calendar', 'timeline', 'Create your master calendar', 'Add testing, application, aid, and school-document windows.', 'At least 12 months before enrollment', 'timeline', 'Core', 'published'),
  ('research-list', 'research', 'Build a first-pass college list', 'Start with institutions that make sense for your budget and interests.', 'Before essay season', 'college-research', 'Core', 'published'),
  ('research-compare', 'research', 'Verify your shortlist', 'Compare official aid pages, application plans, testing policies, and fit notes.', 'Before finalizing applications', 'college-research', 'Core', 'published'),
  ('academics-docs', 'academics', 'Audit academic records', 'List transcripts, predicted grades, translations, and school-profile context you need.', 'Before asking your school to submit documents', 'academics', 'Core', 'published'),
  ('academics-counselor', 'academics', 'Coordinate with your school', 'Agree on a practical recommendation and document-submission timeline.', 'Several weeks before deadlines', 'academics', 'Core', 'published'),
  ('testing-policy', 'testing', 'Check testing requirements', 'Verify SAT or ACT and English-proficiency policies for every shortlisted college.', 'Before test registration', 'standardized-testing', 'Core', 'published'),
  ('testing-plan', 'testing', 'Plan your test dates', 'Choose preparation windows and leave room for a retake only if useful.', 'Before application season', 'standardized-testing', 'Recommended', 'published'),
  ('profile-inventory', 'profile', 'Inventory your activities', 'Capture responsibilities, time spent, outcomes, and what you learned.', 'Before filling applications', 'activities', 'Core', 'published'),
  ('profile-evidence', 'profile', 'Keep an evidence log', 'Save concise notes and links for projects, awards, and contribution claims.', 'Ongoing', 'activities', 'Recommended', 'published'),
  ('essays-story', 'essays', 'Draft your personal statement', 'Start with real moments, not a polished performance.', 'Before supplement season', 'essays', 'Core', 'published'),
  ('essays-supplements', 'essays', 'Track supplemental essays', 'Group prompts, research colleges, and revise for specificity.', 'Before each submission', 'essays', 'Core', 'published'),
  ('apply-platforms', 'applications', 'Create your submission tracker', 'List portals, forms, recommendation status, and fee-waiver routes.', 'Before applications open', 'application-platforms', 'Core', 'published'),
  ('apply-submit', 'applications', 'Run a final submission check', 'Preview each application, verify attachments, submit early, and save confirmation.', 'Before every deadline', 'application-platforms', 'Core', 'published'),
  ('aid-budget', 'aid', 'Model your budget range', 'Estimate a contribution band and separate billed costs from travel and personal expenses.', 'Before finalizing your list', 'financial-aid', 'Core', 'published'),
  ('aid-documents', 'aid', 'Prepare financial-aid records', 'Confirm CSS Profile or alternative forms and gather supporting documentation.', 'Before aid deadlines', 'financial-aid', 'Core', 'published'),
  ('decision-compare', 'decisions', 'Compare offers', 'Review grants, work expectations, indirect costs, and four-year affordability.', 'When decisions arrive', 'decisions', 'Core', 'published'),
  ('decision-respond', 'decisions', 'Respond intentionally', 'Handle deposits, waitlists, and declined offers before their deadlines.', 'By each college''s reply date', 'decisions', 'Core', 'published'),
  ('visa-i20', 'visa', 'Complete I-20 and SEVIS steps', 'Follow your enrolled college''s instructions and official government guidance.', 'After enrollment', 'visa', 'Core', 'published'),
  ('visa-interview', 'visa', 'Prepare for your visa interview', 'Organize documents and practice clear, honest answers about your study plan.', 'Before your interview', 'visa', 'Core', 'published'),
  ('arrival-docs', 'arrival', 'Prepare your travel folder', 'Keep passport, visa, I-20, contacts, and arrival details accessible.', 'Before departure', 'arrival', 'Core', 'published'),
  ('arrival-first-week', 'arrival', 'Plan your first week', 'Review orientation, connectivity, banking, and campus check-in steps.', 'Before departure', 'arrival', 'Recommended', 'published')
on conflict (id) do nothing;

insert into public.colleges (slug, name, short_name, location, institution_type, aid_policy, meets_full_need, merit_aid, summary, status, last_verified_at) values
  ('mit', 'Massachusetts Institute of Technology', 'MIT', 'Cambridge, Massachusetts', 'University', 'Need-blind', true, false, 'Need-blind and full-need for international undergraduate students.', 'published', '2026-06-01'),
  ('harvard', 'Harvard College', 'Harvard', 'Cambridge, Massachusetts', 'University', 'Need-blind', true, false, 'Same admission and aid process regardless of nationality or citizenship.', 'published', '2026-06-01'),
  ('yale', 'Yale College', 'Yale', 'New Haven, Connecticut', 'University', 'Need-blind', true, false, 'Need-blind with need-based aid for international applicants.', 'published', '2026-06-01'),
  ('princeton', 'Princeton University', 'Princeton', 'Princeton, New Jersey', 'University', 'Need-blind', true, false, 'Need-blind, grant-based aid policy for international students.', 'published', '2026-06-01'),
  ('dartmouth', 'Dartmouth College', 'Dartmouth', 'Hanover, New Hampshire', 'University', 'Need-blind', true, false, 'Need-blind and full-need regardless of citizenship.', 'published', '2026-06-01'),
  ('amherst', 'Amherst College', 'Amherst', 'Amherst, Massachusetts', 'Liberal arts college', 'Need-blind', true, false, 'Need-blind evaluation and need-based aid.', 'published', '2026-06-01'),
  ('bowdoin', 'Bowdoin College', 'Bowdoin', 'Brunswick, Maine', 'Liberal arts college', 'Need-blind', true, false, 'Need-blind for international students with full calculated need.', 'published', '2026-06-01'),
  ('brown', 'Brown University', 'Brown', 'Providence, Rhode Island', 'University', 'Need-blind', true, false, 'Need-blind admission for international first-year applicants beginning with the Class of 2029.', 'published', '2026-06-01'),
  ('notre-dame', 'University of Notre Dame', 'Notre Dame', 'Notre Dame, Indiana', 'University', 'Need-blind', true, true, 'Need-blind evaluation for international applicants.', 'published', '2026-06-01'),
  ('stanford', 'Stanford University', 'Stanford', 'Stanford, California', 'University', 'Need-aware', true, false, 'Full need for admitted international students who request aid, with aid considered in evaluation.', 'published', '2026-06-01'),
  ('rochester', 'University of Rochester', 'Rochester', 'Rochester, New York', 'University', 'Need-aware', true, true, 'Financial need contributes to international admission decisions.', 'published', '2026-06-01'),
  ('usc', 'University of Southern California', 'USC', 'Los Angeles, California', 'University', 'Merit-focused', false, true, 'No need-based aid for international applicants; eligible students may compete for merit scholarships.', 'published', '2026-06-01')
on conflict (slug) do nothing;

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
      ts_rank(
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(array_to_string(aliases, ' '), '')), 'A') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(body::text, '')), 'C'),
        websearch_to_tsquery('english', search_query)
      ) + similarity(title, search_query) as rank
    from public.content_entries
    where status = 'published'
      and (search_types is null or content_type = any(search_types))
  ),
  college_matches as (
    select 'colleges'::text, name, summary, '/colleges/' || slug,
      similarity(name, search_query) as rank
    from public.colleges
    where status = 'published'
      and (search_types is null or 'colleges' = any(search_types))
  )
  select * from (
    select * from guide_matches
    union all
    select * from college_matches
  ) results
  where rank > 0.01
  order by rank desc
  limit result_limit offset result_offset;
$$;

create or replace function public.mark_stale_public_records()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.content_entries set status = 'stale' where status = 'published' and next_review_at < current_date;
  update public.colleges set status = 'stale' where status = 'published' and next_review_at < current_date;
end;
$$;

insert into storage.buckets (id, name, public)
values ('editorial-assets', 'editorial-assets', true)
on conflict (id) do nothing;

create policy "public editorial assets" on storage.objects for select to anon, authenticated using (bucket_id = 'editorial-assets');
create policy "publisher editorial assets" on storage.objects for all to authenticated using (
  bucket_id = 'editorial-assets' and public.has_editor_role(array['admin', 'editor'])
) with check (
  bucket_id = 'editorial-assets' and public.has_editor_role(array['admin', 'editor'])
);
