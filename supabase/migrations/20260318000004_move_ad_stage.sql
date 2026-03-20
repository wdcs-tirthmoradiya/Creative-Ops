-- 20260318000004_move_ad_stage.sql
-- Authoritative stage transition function.
-- All rules enforced here — even direct API calls cannot bypass them.

create or replace function move_ad_stage(
  ad_id     uuid,
  new_stage ad_stage,
  moved_by  text
) returns ads as $$
declare
  current_ad   ads;
  days_testing integer;
begin
  -- Lock row to prevent race conditions
  select * into current_ad
  from ads
  where id = ad_id
  for update;

  if not found then
    raise exception 'Ad not found: %', ad_id;
  end if;

  -- ── Validate transition ──────────────────────────────────────────────────
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

  -- ── Enforce 10-day testing lock ──────────────────────────────────────────
  if current_ad.stage = 'Testing' then
    if current_ad.testing_started_at is null then
      raise exception 'Testing start date not set';
    end if;
    days_testing := extract(epoch from (now() - current_ad.testing_started_at)) / 86400;
    if days_testing < 10 then
      raise exception 'Testing lock active: % days remaining', (10 - days_testing)::int;
    end if;
  end if;

  -- ── Enforce max revisions ────────────────────────────────────────────────
  if new_stage = 'Ad Revision' then
    if current_ad.revision_round >= current_ad.max_revisions then
      raise exception 'Maximum revision rounds reached (% of %)',
        current_ad.revision_round, current_ad.max_revisions;
    end if;
  end if;

  -- ── Apply move ───────────────────────────────────────────────────────────
  update ads
  set
    stage              = new_stage,
    stage_entered_at   = now(),
    updated_at         = now(),
    revision_round     = case
                           when new_stage = 'Ad Revision' then revision_round + 1
                           else revision_round
                         end,
    testing_started_at = case
                           when new_stage = 'Testing' then now()
                           else testing_started_at
                         end
  where id = ad_id
  returning * into current_ad;

  -- ── Auto-log ─────────────────────────────────────────────────────────────
  insert into activity_log (ad_id, action, performed_by)
  values (ad_id, 'Moved to ' || new_stage::text, moved_by);

  return current_ad;
end;
$$ language plpgsql security definer;
