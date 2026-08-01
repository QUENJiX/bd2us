-- Fall 2027 field-guide data expansion
alter table public.colleges
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists region text,
  add column if not exists institution_control text,
  add column if not exists campus_setting text,
  add column if not exists enrollment_band text,
  add column if not exists cost_of_attendance integer,
  add column if not exists acceptance_rate numeric(5,2),
  add column if not exists international_aid_percent numeric(5,2),
  add column if not exists average_international_aid integer,
  add column if not exists special_note text,
  add column if not exists source_scope text,
  add column if not exists original_description text,
  add column if not exists dataset_reviewed_at date;

alter table public.colleges alter column meets_full_need drop not null;
alter table public.colleges alter column merit_aid drop not null;
alter table public.colleges alter column meets_full_need drop default;
alter table public.colleges alter column merit_aid drop default;

create index if not exists colleges_region_idx on public.colleges(region);
create index if not exists colleges_control_idx on public.colleges(institution_control);
create index if not exists colleges_cost_idx on public.colleges(cost_of_attendance);
create index if not exists colleges_acceptance_idx on public.colleges(acceptance_rate);
create index if not exists colleges_international_aid_idx on public.colleges(international_aid_percent);

delete from public.content_sources as newer
using public.content_sources as keeper
where newer.content_entry_id = keeper.content_entry_id
  and newer.url = keeper.url and newer.id > keeper.id;
create unique index if not exists content_sources_entry_url_idx on public.content_sources(content_entry_id, url);

comment on column public.colleges.acceptance_rate is 'Overall institutional acceptance rate for context; never an individual admission probability.';
comment on column public.colleges.source_scope is 'Explains whether a record is a dataset baseline or has current official-source verification.';
comment on column public.colleges.original_description is 'Original normalized dataset prose retained for editorial traceability.';
