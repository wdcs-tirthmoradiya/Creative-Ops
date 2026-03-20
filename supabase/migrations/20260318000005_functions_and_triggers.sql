-- 20260318000005_functions_and_triggers.sql

-- ── Manual note on any ad ────────────────────────────────────────────────────
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

  -- Touch parent ad so realtime fires to all subscribers
  update ads set updated_at = now() where id = ad_id;

  return new_log;
end;
$$ language plpgsql security definer;


-- ── Auto-update updated_at on every ads row change ───────────────────────────
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on ads
for each row
execute function handle_updated_at();


-- ── Auto-log ad creation ─────────────────────────────────────────────────────
create or replace function log_ad_created()
returns trigger as $$
begin
  insert into activity_log (ad_id, action, performed_by)
  values (new.id, 'Ad created', new.strategist);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_ad_created
after insert on ads
for each row
execute function log_ad_created();
