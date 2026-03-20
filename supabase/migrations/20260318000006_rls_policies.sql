-- 20260318000006_rls_policies.sql
-- V1: permissive anon access (no login system yet).
-- When auth is added, tighten these to per-user policies.

-- Enable RLS on all tables
alter table ads           enable row level security;
alter table activity_log  enable row level security;
alter table ideas         enable row level security;
alter table learnings     enable row level security;

-- ── ads ──────────────────────────────────────────────────────────────────────
create policy "anon_select_ads"
  on ads for select to anon using (true);

create policy "anon_insert_ads"
  on ads for insert to anon with check (true);

create policy "anon_update_ads"
  on ads for update to anon using (true) with check (true);

-- Soft-delete only — no hard deletes in production
-- create policy "anon_delete_ads" on ads for delete to anon using (false);

-- ── activity_log ─────────────────────────────────────────────────────────────
create policy "anon_select_activity_log"
  on activity_log for select to anon using (true);

create policy "anon_insert_activity_log"
  on activity_log for insert to anon with check (true);

-- No updates or deletes — append-only log
-- create policy "anon_update_activity_log" ...
-- create policy "anon_delete_activity_log" ...

-- ── ideas ─────────────────────────────────────────────────────────────────────
create policy "anon_all_ideas"
  on ideas for all to anon
  using (true) with check (true);

-- ── learnings ─────────────────────────────────────────────────────────────────
create policy "anon_all_learnings"
  on learnings for all to anon
  using (true) with check (true);
