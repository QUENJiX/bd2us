-- One SELECT policy per role/action keeps public reading and editorial access
-- clear while avoiding repeated permissive-policy evaluation.

drop policy if exists "public content" on public.content_entries;
drop policy if exists "editor content entries read" on public.content_entries;
drop policy if exists "publisher content entries write" on public.content_entries;
create policy "anon published content" on public.content_entries for select to anon using (status = 'published');
create policy "authenticated content read" on public.content_entries for select to authenticated using (status = 'published' or (select public.has_editor_role()));
create policy "editor content insert" on public.content_entries for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor content update" on public.content_entries for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor content delete" on public.content_entries for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public content sources" on public.content_sources;
drop policy if exists "editor content sources" on public.content_sources;
create policy "anon published content sources" on public.content_sources for select to anon using (exists (select 1 from public.content_entries where content_entries.id = content_entry_id and status = 'published'));
create policy "authenticated content sources read" on public.content_sources for select to authenticated using ((select public.has_editor_role()) or exists (select 1 from public.content_entries where content_entries.id = content_entry_id and status = 'published'));
create policy "editor content sources insert" on public.content_sources for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor content sources update" on public.content_sources for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor content sources delete" on public.content_sources for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public colleges" on public.colleges;
drop policy if exists "editor colleges read" on public.colleges;
drop policy if exists "publisher colleges write" on public.colleges;
create policy "anon published colleges" on public.colleges for select to anon using (status = 'published');
create policy "authenticated colleges read" on public.colleges for select to authenticated using (status = 'published' or (select public.has_editor_role()));
create policy "editor colleges insert" on public.colleges for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor colleges update" on public.colleges for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor colleges delete" on public.colleges for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public college facts" on public.college_facts;
drop policy if exists "editor college facts read" on public.college_facts;
drop policy if exists "publisher college facts write" on public.college_facts;
create policy "anon published college facts" on public.college_facts for select to anon using (status = 'published');
create policy "authenticated college facts read" on public.college_facts for select to authenticated using (status = 'published' or (select public.has_editor_role()));
create policy "editor college facts insert" on public.college_facts for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor college facts update" on public.college_facts for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor college facts delete" on public.college_facts for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public college sources" on public.college_sources;
drop policy if exists "editor college sources" on public.college_sources;
create policy "anon published college sources" on public.college_sources for select to anon using (exists (select 1 from public.colleges where colleges.id = college_id and status = 'published'));
create policy "authenticated college sources read" on public.college_sources for select to authenticated using ((select public.has_editor_role()) or exists (select 1 from public.colleges where colleges.id = college_id and status = 'published'));
create policy "editor college sources insert" on public.college_sources for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor college sources update" on public.college_sources for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor college sources delete" on public.college_sources for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public college deadlines" on public.college_deadlines;
drop policy if exists "editor college deadlines" on public.college_deadlines;
create policy "anon published college deadlines" on public.college_deadlines for select to anon using (exists (select 1 from public.colleges where colleges.id = college_id and status = 'published'));
create policy "authenticated college deadlines read" on public.college_deadlines for select to authenticated using ((select public.has_editor_role()) or exists (select 1 from public.colleges where colleges.id = college_id and status = 'published'));
create policy "editor college deadlines insert" on public.college_deadlines for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor college deadlines update" on public.college_deadlines for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor college deadlines delete" on public.college_deadlines for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public college tags" on public.college_tags;
drop policy if exists "editor college tags" on public.college_tags;
create policy "anon published college tags" on public.college_tags for select to anon using (exists (select 1 from public.colleges where colleges.id = college_id and status = 'published'));
create policy "authenticated college tags read" on public.college_tags for select to authenticated using ((select public.has_editor_role()) or exists (select 1 from public.colleges where colleges.id = college_id and status = 'published'));
create policy "editor college tags insert" on public.college_tags for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor college tags update" on public.college_tags for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor college tags delete" on public.college_tags for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public roadmap templates" on public.roadmap_templates;
drop policy if exists "editor roadmap templates read" on public.roadmap_templates;
drop policy if exists "publisher roadmap templates write" on public.roadmap_templates;
create policy "anon published roadmap templates" on public.roadmap_templates for select to anon using (status = 'published');
create policy "authenticated roadmap templates read" on public.roadmap_templates for select to authenticated using (status = 'published' or (select public.has_editor_role()));
create policy "editor roadmap templates insert" on public.roadmap_templates for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor roadmap templates update" on public.roadmap_templates for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor roadmap templates delete" on public.roadmap_templates for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public roadmap tasks" on public.roadmap_tasks;
drop policy if exists "editor roadmap tasks read" on public.roadmap_tasks;
drop policy if exists "publisher roadmap tasks write" on public.roadmap_tasks;
create policy "anon published roadmap tasks" on public.roadmap_tasks for select to anon using (status = 'published');
create policy "authenticated roadmap tasks read" on public.roadmap_tasks for select to authenticated using (status = 'published' or (select public.has_editor_role()));
create policy "editor roadmap tasks insert" on public.roadmap_tasks for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor roadmap tasks update" on public.roadmap_tasks for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor roadmap tasks delete" on public.roadmap_tasks for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

drop policy if exists "public verified stories" on public.success_stories;
drop policy if exists "editor success stories read" on public.success_stories;
drop policy if exists "publisher success stories write" on public.success_stories;
create policy "anon verified stories" on public.success_stories for select to anon using (status = 'published' and consent_recorded_at is not null);
create policy "authenticated stories read" on public.success_stories for select to authenticated using ((status = 'published' and consent_recorded_at is not null) or (select public.has_editor_role()));
create policy "editor stories insert" on public.success_stories for insert to authenticated with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor stories update" on public.success_stories for update to authenticated using ((select public.has_editor_role(array['admin', 'editor']))) with check ((select public.has_editor_role(array['admin', 'editor'])));
create policy "editor stories delete" on public.success_stories for delete to authenticated using ((select public.has_editor_role(array['admin', 'editor'])));

grant select, insert, update, delete on table
  public.content_entries, public.content_sources, public.content_versions,
  public.colleges, public.college_facts, public.college_sources,
  public.college_deadlines, public.college_tags, public.roadmap_templates,
  public.roadmap_tasks, public.success_stories
to authenticated;
