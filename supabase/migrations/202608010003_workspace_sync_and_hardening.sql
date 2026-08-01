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
create index if not exists user_deadlines_user_due_idx on public.user_deadlines(user_id, due_at) where deleted_at is null;
create index if not exists saved_colleges_college_idx on public.saved_colleges(college_id);
create index if not exists college_sources_college_idx on public.college_sources(college_id);
create index if not exists college_deadlines_college_idx on public.college_deadlines(college_id);
create index if not exists content_sources_entry_idx on public.content_sources(content_entry_id);
create index if not exists content_versions_entry_idx on public.content_versions(content_entry_id);
create index if not exists college_slug_aliases_college_idx on public.college_slug_aliases(college_id);

alter function public.search_public_content(text, text[], integer, integer) set search_path = public, extensions;
alter function public.has_editor_role(text[]) set search_path = public;
alter function public.mark_stale_public_records() set search_path = public;
revoke all on function public.has_editor_role(text[]) from public, anon;
grant execute on function public.has_editor_role(text[]) to authenticated, service_role;
revoke all on function public.mark_stale_public_records() from public, anon, authenticated;
grant execute on function public.mark_stale_public_records() to service_role;

-- Public files are readable, but listing the whole bucket is unnecessary.
drop policy if exists "public editorial assets" on storage.objects;
