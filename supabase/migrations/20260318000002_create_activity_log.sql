-- 20260318000002_create_activity_log.sql
-- Append-only activity log — never delete rows from this table

create table activity_log (
  id           uuid        primary key default gen_random_uuid(),
  ad_id        uuid        not null references ads(id) on delete cascade,
  action       text        not null,
  performed_by text        not null,
  note         text,                         -- optional manual note
  created_at   timestamptz not null default now()
);

create index idx_activity_log_ad_id     on activity_log(ad_id);
create index idx_activity_log_created_at on activity_log(created_at desc);
