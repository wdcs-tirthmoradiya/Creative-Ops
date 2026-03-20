-- ============================================================
-- CreativeOps Hub — Full Database Setup
-- Paste this entire file into Supabase SQL Editor and click Run.
-- This replaces running migrations via CLI.
-- ============================================================


-- ── 1. TYPES ─────────────────────────────────────────────────────────────────

drop type if exists ad_stage       cascade;
drop type if exists ad_type        cascade;
drop type if exists priority_level cascade;
drop type if exists ad_format      cascade;
drop type if exists content_source cascade;
drop type if exists idea_tag       cascade;
drop type if exists learning_result cascade;

create type ad_stage as enum (
  'Idea',
  'Brief Writing',
  'Brief Review',
  'Ad Creation',
  'Ad Review',
  'Ad Revision',
  'Pending Upload',
  'Testing',
  'Winner',
  'Loser'
);

create type ad_type        as enum ('New Concept', 'Iteration');
create type priority_level as enum ('High', 'Medium', 'Low');
create type ad_format      as enum ('Video Ad', 'Static Ad', 'Native Ad');
create type content_source as enum ('Internal Team', 'UGC Creator', 'AI Generated');
create type idea_tag       as enum ('New Concept', 'Iteration', 'Angle to Test');
create type learning_result as enum ('Winner', 'Loser', 'Inconclusive');


-- ── 2. TABLES ─────────────────────────────────────────────────────────────────

drop table if exists learnings    cascade;
drop table if exists ideas        cascade;
drop table if exists activity_log cascade;
drop table if exists ads          cascade;

create table ads (
  id                 uuid           primary key default gen_random_uuid(),
  title              text           not null,
  ad_type            ad_type        not null default 'New Concept',
  priority           priority_level not null default 'Medium',
  format             ad_format      not null,
  content_source     content_source not null,
  stage              ad_stage       not null default 'Idea',
  assigned_to        text           not null,
  strategist         text           not null,
  ad_spend           numeric(10,2)  not null default 0,
  revision_round     smallint       not null default 0,
  max_revisions      smallint       not null default 2,
  testing_started_at timestamptz,
  stage_entered_at   timestamptz    not null default now(),
  created_at         timestamptz    not null default now(),
  updated_at         timestamptz    not null default now()
);

create table activity_log (
  id           uuid        primary key default gen_random_uuid(),
  ad_id        uuid        not null references ads(id) on delete cascade,
  action       text        not null,
  performed_by text        not null,
  note         text,
  created_at   timestamptz not null default now()
);

create table ideas (
  id           uuid      primary key default gen_random_uuid(),
  description  text      not null,
  submitted_by text      not null,
  tag          idea_tag  not null default 'New Concept',
  promoted     boolean   not null default false,
  created_at   timestamptz not null default now()
);

create table learnings (
  id         uuid             primary key default gen_random_uuid(),
  ad_id      uuid             references ads(id) on delete set null,
  ad_title   text             not null,
  result     learning_result  not null,
  insight    text             not null,
  logged_by  text             not null,
  created_at timestamptz      not null default now()
);


-- ── 3. INDEXES ────────────────────────────────────────────────────────────────

create index idx_ads_stage            on ads(stage);
create index idx_ads_assigned_to      on ads(assigned_to);
create index idx_ads_strategist       on ads(strategist);
create index idx_ads_created_at       on ads(created_at desc);
create index idx_activity_log_ad_id   on activity_log(ad_id);
create index idx_activity_log_ts      on activity_log(created_at desc);
create index idx_ideas_promoted       on ideas(promoted);
create index idx_learnings_created_at on learnings(created_at desc);


-- ── 4. FUNCTIONS & TRIGGERS ──────────────────────────────────────────────────

-- Auto-update updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on ads;
create trigger set_updated_at
  before update on ads
  for each row execute function handle_updated_at();


-- Auto-log ad creation
create or replace function log_ad_created()
returns trigger as $$
begin
  insert into activity_log (ad_id, action, performed_by)
  values (new.id, 'Ad created', new.strategist);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_ad_created on ads;
create trigger on_ad_created
  after insert on ads
  for each row execute function log_ad_created();


-- Core stage transition function (all rules enforced here)
create or replace function move_ad_stage(
  ad_id     uuid,
  new_stage ad_stage,
  moved_by  text
) returns ads as $$
declare
  current_ad   ads;
  days_testing integer;
begin
  select * into current_ad from ads where id = ad_id for update;

  if not found then
    raise exception 'Ad not found: %', ad_id;
  end if;

  -- Validate the transition is allowed
  if not (
    (current_ad.stage = 'Idea'           and new_stage = 'Brief Writing')   or
    (current_ad.stage = 'Brief Writing'  and new_stage = 'Brief Review')    or
    (current_ad.stage = 'Brief Review'   and new_stage in ('Ad Creation', 'Brief Writing')) or
    (current_ad.stage = 'Ad Creation'    and new_stage = 'Ad Review')       or
    (current_ad.stage = 'Ad Review'      and new_stage in ('Ad Revision', 'Pending Upload')) or
    (current_ad.stage = 'Ad Revision'    and new_stage = 'Ad Review')       or
    (current_ad.stage = 'Pending Upload' and new_stage = 'Testing')         or
    (current_ad.stage = 'Testing'        and new_stage in ('Winner', 'Loser'))
  ) then
    raise exception 'Invalid stage transition: % → %', current_ad.stage, new_stage;
  end if;

  -- Enforce 10-day testing lock
  if current_ad.stage = 'Testing' then
    if current_ad.testing_started_at is null then
      raise exception 'Testing start date not set';
    end if;
    days_testing := extract(epoch from (now() - current_ad.testing_started_at)) / 86400;
    if days_testing < 10 then
      raise exception 'Testing lock active: % days remaining', (10 - days_testing)::int;
    end if;
  end if;

  -- Enforce max revisions
  if new_stage = 'Ad Revision' and current_ad.revision_round >= current_ad.max_revisions then
    raise exception 'Maximum revision rounds reached (% of %)',
      current_ad.revision_round, current_ad.max_revisions;
  end if;

  -- Apply the move
  update ads set
    stage              = new_stage,
    stage_entered_at   = now(),
    updated_at         = now(),
    revision_round     = case when new_stage = 'Ad Revision' then revision_round + 1 else revision_round end,
    testing_started_at = case when new_stage = 'Testing'     then now()              else testing_started_at end
  where id = ad_id
  returning * into current_ad;

  -- Auto-log the move
  insert into activity_log (ad_id, action, performed_by)
  values (ad_id, 'Moved to ' || new_stage::text, moved_by);

  return current_ad;
end;
$$ language plpgsql security definer;


-- Manual note on any ad
create or replace function add_activity_note(
  ad_id      uuid,
  note_text  text,
  added_by   text
) returns activity_log as $$
declare
  new_log activity_log;
begin
  if trim(note_text) = '' then
    raise exception 'Note text cannot be empty';
  end if;

  insert into activity_log (ad_id, action, performed_by, note)
  values (ad_id, 'Note added', added_by, note_text)
  returning * into new_log;

  -- Touch parent ad so realtime fires
  update ads set updated_at = now() where id = ad_id;

  return new_log;
end;
$$ language plpgsql security definer;


-- ── 5. ROW LEVEL SECURITY ────────────────────────────────────────────────────

alter table ads           enable row level security;
alter table activity_log  enable row level security;
alter table ideas         enable row level security;
alter table learnings     enable row level security;

-- Drop existing policies first to avoid conflicts
drop policy if exists "anon_select_ads"          on ads;
drop policy if exists "anon_insert_ads"          on ads;
drop policy if exists "anon_update_ads"          on ads;
drop policy if exists "anon_select_activity_log" on activity_log;
drop policy if exists "anon_insert_activity_log" on activity_log;
drop policy if exists "anon_all_ideas"           on ideas;
drop policy if exists "anon_all_learnings"       on learnings;

create policy "anon_select_ads"          on ads           for select to anon using (true);
create policy "anon_insert_ads"          on ads           for insert to anon with check (true);
create policy "anon_update_ads"          on ads           for update to anon using (true) with check (true);
create policy "anon_select_activity_log" on activity_log  for select to anon using (true);
create policy "anon_insert_activity_log" on activity_log  for insert to anon with check (true);
create policy "anon_all_ideas"           on ideas         for all    to anon using (true) with check (true);
create policy "anon_all_learnings"       on learnings     for all    to anon using (true) with check (true);


-- ── 6. REALTIME ──────────────────────────────────────────────────────────────

alter publication supabase_realtime add table ads;
alter publication supabase_realtime add table activity_log;


-- ── 7. SEED DATA ─────────────────────────────────────────────────────────────
-- Optional — remove if you don't want demo data.

insert into ads (id, title, ad_type, priority, format, content_source, stage, assigned_to, strategist, ad_spend, revision_round, testing_started_at, stage_entered_at, created_at) values
  ('00000000-0000-0000-0000-000000000001', 'Summer Sale Hook',      'New Concept', 'High',   'Video Ad',  'Internal Team', 'Testing',        'Jake', 'Sara', 1200, 0, now()-'8 days'::interval,  now()-'8 days'::interval,  now()-'14 days'::interval),
  ('00000000-0000-0000-0000-000000000002', 'Founder UGC Story',     'New Concept', 'High',   'Video Ad',  'UGC Creator',   'Ad Review',      'Jake', 'Sara', 0,    0, null,                       now()-'2 days'::interval,  now()-'10 days'::interval),
  ('00000000-0000-0000-0000-000000000003', 'Pain Point Angle v2',   'Iteration',   'Medium', 'Static Ad', 'Internal Team', 'Brief Writing',  'Sara', 'Sara', 0,    0, null,                       now()-'3 days'::interval,  now()-'3 days'::interval),
  ('00000000-0000-0000-0000-000000000004', 'Comparison Native Ad',  'New Concept', 'Low',    'Native Ad', 'AI Generated',  'Ad Revision',    'Jake', 'Mia',  0,    1, null,                       now()-'1 day'::interval,   now()-'7 days'::interval),
  ('00000000-0000-0000-0000-000000000005', 'Testimonial Carousel',  'Iteration',   'High',   'Static Ad', 'UGC Creator',   'Pending Upload', 'Tom',  'Sara', 0,    0, null,                       now()-'1 day'::interval,   now()-'5 days'::interval),
  ('00000000-0000-0000-0000-000000000006', 'Discount Urgency Hook', 'New Concept', 'Medium', 'Video Ad',  'Internal Team', 'Winner',         'Jake', 'Sara', 3400, 1, now()-'15 days'::interval,  now()-'2 days'::interval,  now()-'22 days'::interval),
  ('00000000-0000-0000-0000-000000000007', 'Product Demo Reel',     'New Concept', 'Medium', 'Video Ad',  'Internal Team', 'Idea',           'Sara', 'Sara', 0,    0, null,                       now()-'1 day'::interval,   now()-'1 day'::interval),
  ('00000000-0000-0000-0000-000000000008', 'Before/After Static',   'Iteration',   'Low',    'Static Ad', 'AI Generated',  'Loser',          'Jake', 'Mia',  890,  0, now()-'15 days'::interval,  now()-'3 days'::interval,  now()-'20 days'::interval),
  ('00000000-0000-0000-0000-000000000009', 'Social Proof Bundle',   'Iteration',   'High',   'Video Ad',  'UGC Creator',   'Brief Review',   'Sara', 'Sara', 0,    0, null,                       now()-'1 day'::interval,   now()-'4 days'::interval);

insert into ideas (description, submitted_by, tag) values
  ('Test a myth vs truth hook angle',                 'Founder', 'Angle to Test'),
  ('Iterate on summer sale video with a longer hook', 'Sara',    'Iteration'),
  ('Try a carousel native ad format for Q2',          'Jake',    'New Concept');

insert into learnings (ad_id, ad_title, result, insight, logged_by) values
  ('00000000-0000-0000-0000-000000000006', 'Discount Urgency Hook', 'Winner',
   '3-second hook with price reveal drove 2x CTR vs control. Direct urgency outperformed lifestyle. Keep hooks under 4 seconds.', 'Founder'),
  ('00000000-0000-0000-0000-000000000008', 'Before/After Static',   'Loser',
   'Static before/after underperformed — audience too familiar with format. Try video or add testimonial overlay.', 'Sara');


-- ── DONE ─────────────────────────────────────────────────────────────────────
-- Verify by running:
--   select count(*) from ads;
--   select count(*) from activity_log;
