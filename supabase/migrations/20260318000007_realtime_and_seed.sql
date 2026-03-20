-- 20260318000007_realtime_and_seed.sql

-- ── Enable realtime on ads table ─────────────────────────────────────────────
alter publication supabase_realtime add table ads;
alter publication supabase_realtime add table activity_log;


-- ── Seed data (development only) ─────────────────────────────────────────────
-- Remove or skip this block in production.

insert into ads (id, title, ad_type, priority, format, content_source, stage, assigned_to, strategist, ad_spend, revision_round, testing_started_at, stage_entered_at, created_at)
values
  ('00000000-0000-0000-0000-000000000001', 'Summer Sale Hook',       'New Concept', 'High',   'Video Ad',  'Internal Team', 'Testing',        'Jake', 'Sara', 1200, 0, now() - interval '8 days',  now() - interval '8 days',  now() - interval '14 days'),
  ('00000000-0000-0000-0000-000000000002', 'Founder UGC Story',      'New Concept', 'High',   'Video Ad',  'UGC Creator',   'Ad Review',      'Jake', 'Sara', 0,    0, null,                        now() - interval '2 days',  now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000003', 'Pain Point Angle v2',    'Iteration',   'Medium', 'Static Ad', 'Internal Team', 'Brief Writing',  'Sara', 'Sara', 0,    0, null,                        now() - interval '3 days',  now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000004', 'Comparison Native Ad',   'New Concept', 'Low',    'Native Ad', 'AI Generated',  'Ad Revision',    'Jake', 'Mia',  0,    1, null,                        now() - interval '1 day',   now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000005', 'Testimonial Carousel',   'Iteration',   'High',   'Static Ad', 'UGC Creator',   'Pending Upload', 'Tom',  'Sara', 0,    0, null,                        now() - interval '1 day',   now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000006', 'Discount Urgency Hook',  'New Concept', 'Medium', 'Video Ad',  'Internal Team', 'Winner',         'Jake', 'Sara', 3400, 1, now() - interval '15 days', now() - interval '2 days',  now() - interval '22 days'),
  ('00000000-0000-0000-0000-000000000007', 'Product Demo Reel',      'New Concept', 'Medium', 'Video Ad',  'Internal Team', 'Idea',           'Sara', 'Sara', 0,    0, null,                        now() - interval '1 day',   now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000008', 'Before/After Static',    'Iteration',   'Low',    'Static Ad', 'AI Generated',  'Loser',          'Jake', 'Mia',  890,  0, now() - interval '15 days', now() - interval '3 days',  now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000009', 'Social Proof Bundle',    'Iteration',   'High',   'Video Ad',  'UGC Creator',   'Brief Review',   'Sara', 'Sara', 0,    0, null,                        now() - interval '1 day',   now() - interval '4 days');

insert into activity_log (ad_id, action, performed_by) values
  ('00000000-0000-0000-0000-000000000001', 'Ad created',       'Sara'),
  ('00000000-0000-0000-0000-000000000001', 'Brief approved',   'Founder'),
  ('00000000-0000-0000-0000-000000000001', 'Moved to Testing', 'Founder'),
  ('00000000-0000-0000-0000-000000000002', 'Ad created',       'Sara'),
  ('00000000-0000-0000-0000-000000000002', 'Moved to Ad Review','Jake'),
  ('00000000-0000-0000-0000-000000000004', 'Revision requested','Founder'),
  ('00000000-0000-0000-0000-000000000006', 'Marked Winner',    'Founder'),
  ('00000000-0000-0000-0000-000000000008', 'Marked Loser',     'Founder');

insert into ideas (description, submitted_by, tag) values
  ('Test a myth vs truth hook angle',                      'Founder', 'Angle to Test'),
  ('Iterate on summer sale video with a longer hook',      'Sara',    'Iteration'),
  ('Try a carousel native ad format for Q2',               'Jake',    'New Concept');

insert into learnings (ad_id, ad_title, result, insight, logged_by) values
  (
    '00000000-0000-0000-0000-000000000006',
    'Discount Urgency Hook',
    'Winner',
    '3-second hook with a price reveal drove 2x CTR vs control. Direct urgency language outperformed lifestyle imagery. Keep video hooks under 4 seconds.',
    'Founder'
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'Before/After Static',
    'Loser',
    'Static before/after format underperformed — audience already familiar with format. Try video or add a testimonial overlay for stronger social proof.',
    'Sara'
  );
