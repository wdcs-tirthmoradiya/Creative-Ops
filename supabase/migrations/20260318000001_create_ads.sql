-- 20260318000001_create_ads.sql
-- Core ads table — single source of truth for every ad in the system

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

create type ad_type as enum ('New Concept', 'Iteration');

create type priority_level as enum ('High', 'Medium', 'Low');

create type ad_format as enum ('Video Ad', 'Static Ad', 'Native Ad');

create type content_source as enum ('Internal Team', 'UGC Creator', 'AI Generated');

create table ads (
  id                  uuid        primary key default gen_random_uuid(),
  title               text        not null,
  ad_type             ad_type     not null default 'New Concept',
  priority            priority_level not null default 'Medium',
  format              ad_format   not null,
  content_source      content_source not null,
  stage               ad_stage    not null default 'Idea',
  assigned_to         text        not null,
  strategist          text        not null,
  ad_spend            numeric(10,2) not null default 0,
  revision_round      smallint    not null default 0,
  max_revisions       smallint    not null default 2,
  testing_started_at  timestamptz,
  stage_entered_at    timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Indexes for common query patterns
create index idx_ads_stage       on ads(stage);
create index idx_ads_assigned_to on ads(assigned_to);
create index idx_ads_strategist  on ads(strategist);
create index idx_ads_created_at  on ads(created_at desc);
