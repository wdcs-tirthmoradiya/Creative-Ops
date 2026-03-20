-- 20260318000003_create_ideas_learnings.sql

create type idea_tag as enum ('New Concept', 'Iteration', 'Angle to Test');

create table ideas (
  id           uuid      primary key default gen_random_uuid(),
  description  text      not null,
  submitted_by text      not null,
  tag          idea_tag  not null default 'New Concept',
  promoted     boolean   not null default false,
  created_at   timestamptz not null default now()
);

create index idx_ideas_promoted   on ideas(promoted);
create index idx_ideas_created_at on ideas(created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────

create type learning_result as enum ('Winner', 'Loser', 'Inconclusive');

create table learnings (
  id         uuid             primary key default gen_random_uuid(),
  ad_id      uuid             references ads(id) on delete set null,
  ad_title   text             not null,
  result     learning_result  not null,
  insight    text             not null,
  logged_by  text             not null,
  created_at timestamptz      not null default now()
);

create index idx_learnings_created_at on learnings(created_at desc);
create index idx_learnings_result     on learnings(result);
