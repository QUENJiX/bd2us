-- Backward-compatible production additions. Existing user rows and college UUIDs are preserved.

alter table public.user_task_progress add column if not exists deleted_at timestamptz;
alter table public.saved_colleges add column if not exists deleted_at timestamptz;
alter table public.user_deadlines add column if not exists updated_at timestamptz not null default now();
alter table public.user_deadlines add column if not exists deleted_at timestamptz;
alter table public.user_deadlines add column if not exists stable_key text;

create table if not exists public.user_reading_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('guide', 'blog')),
  content_slug text not null,
  bookmarked boolean not null default false,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, content_type, content_slug)
);

create table if not exists public.college_slug_aliases (
  alias text primary key,
  college_id uuid not null references public.colleges(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Search text is not retained. Keep the legacy empty table for a reversible
-- migration path, but remove all browser-role access to it.
revoke all on table public.search_queries from anon, authenticated;
comment on table public.search_queries is 'Legacy table retained empty; BD2US search does not write applicant queries.';

alter table public.user_reading_state enable row level security;
alter table public.college_slug_aliases enable row level security;

drop policy if exists "own reading state" on public.user_reading_state;
create policy "own reading state" on public.user_reading_state
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "public college slug aliases" on public.college_slug_aliases;
create policy "public college slug aliases" on public.college_slug_aliases
  for select to anon, authenticated
  using (exists (
    select 1 from public.colleges
    where colleges.id = college_slug_aliases.college_id and colleges.status = 'published'
  ));

create index if not exists user_task_progress_task_idx on public.user_task_progress(task_id);
create index if not exists roadmap_tasks_stage_idx on public.roadmap_tasks(stage_id);
create index if not exists user_deadlines_user_due_idx on public.user_deadlines(user_id, due_at) where deleted_at is null;
create index if not exists saved_colleges_college_idx on public.saved_colleges(college_id);
create index if not exists college_sources_college_idx on public.college_sources(college_id);
create index if not exists college_deadlines_college_idx on public.college_deadlines(college_id);
create index if not exists content_sources_entry_idx on public.content_sources(content_entry_id);
create index if not exists content_versions_entry_idx on public.content_versions(content_entry_id);
create index if not exists content_versions_editor_idx on public.content_versions(editor_id) where editor_id is not null;
create index if not exists college_slug_aliases_college_idx on public.college_slug_aliases(college_id);
create index if not exists college_facts_source_idx on public.college_facts(source_id) where source_id is not null;
create index if not exists audit_log_actor_idx on public.audit_log(actor_id) where actor_id is not null;

alter function public.search_public_content(text, text[], integer, integer) set search_path = public, extensions;
alter function public.has_editor_role(text[]) set search_path = '';
alter function public.mark_stale_public_records() set search_path = '';
alter function public.has_editor_role(text[]) security invoker;
revoke all on function public.has_editor_role(text[]) from public, anon;
grant execute on function public.has_editor_role(text[]) to authenticated, service_role;
revoke all on function public.mark_stale_public_records() from public, anon, authenticated;
grant execute on function public.mark_stale_public_records() to service_role;
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;

create schema if not exists extensions;
do $$
begin
  if exists (
    select 1 from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pg_trgm' and n.nspname = 'public'
  ) then
    alter extension pg_trgm set schema extensions;
  end if;
end
$$;

-- Supabase now requires explicit Data API grants. RLS remains the row-level
-- authorization boundary for every table exposed to a browser client.
grant select on table
  public.roadmap_templates, public.roadmap_tasks, public.content_entries,
  public.content_sources, public.colleges, public.college_facts,
  public.college_sources, public.college_deadlines, public.college_tags,
  public.college_slug_aliases, public.success_stories
to anon, authenticated;

grant select, insert, update, delete on table
  public.profiles, public.user_task_progress, public.user_deadlines,
  public.saved_colleges, public.user_reading_state
to authenticated;

grant all privileges on table
  public.profiles, public.roadmap_templates, public.roadmap_tasks,
  public.user_task_progress, public.user_deadlines, public.content_entries,
  public.content_sources, public.content_versions, public.colleges,
  public.college_facts, public.college_sources, public.college_deadlines,
  public.college_tags, public.saved_colleges, public.user_reading_state,
  public.college_slug_aliases, public.success_stories, public.feedback_messages,
  public.audit_log
to service_role;

grant execute on function public.search_public_content(text, text[], integer, integer)
to anon, authenticated, service_role;

-- Public editorial files must live under the explicit public/ prefix. Narrow
-- the existing policy in place so the whole bucket cannot be listed.
alter policy "public editorial assets" on storage.objects
  using (bucket_id = 'editorial-assets' and name like 'public/%');
