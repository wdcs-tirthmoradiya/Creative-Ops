/**
 * Demo seed data used when Supabase is not configured.
 * Remove once connected to a real Supabase project.
 */
const now = Date.now()
const d   = (n) => new Date(now - n * 86_400_000).toISOString()

export const SEED_ADS = [
  {
    id: '1', title: 'Summer Sale Hook', ad_type: 'New Concept', priority: 'High',
    format: 'Video Ad', content_source: 'Internal Team', stage: 'Testing',
    assigned_to: 'Jake', strategist: 'Sara', ad_spend: 1200,
    revision_round: 0, max_revisions: 2,
    testing_started_at: d(8), stage_entered_at: d(8), created_at: d(14),
    activity_log: [
      { id: 'l1', ad_id: '1', action: 'Brief written',   performed_by: 'Sara',    note: null, created_at: d(14) },
      { id: 'l2', ad_id: '1', action: 'Brief approved',  performed_by: 'Founder', note: null, created_at: d(13) },
      { id: 'l3', ad_id: '1', action: 'Moved to Testing',performed_by: 'Founder', note: null, created_at: d(8) },
    ],
  },
  {
    id: '2', title: 'Founder UGC Story', ad_type: 'New Concept', priority: 'High',
    format: 'Video Ad', content_source: 'UGC Creator', stage: 'Ad Review',
    assigned_to: 'Founder', strategist: 'Sara', ad_spend: 0,
    revision_round: 0, max_revisions: 2,
    testing_started_at: null, stage_entered_at: d(2), created_at: d(10),
    activity_log: [
      { id: 'l4', ad_id: '2', action: 'Brief written',     performed_by: 'Sara', note: null, created_at: d(10) },
      { id: 'l5', ad_id: '2', action: 'Moved to Ad Review',performed_by: 'Jake', note: null, created_at: d(2) },
    ],
  },
  {
    id: '3', title: 'Pain Point Angle v2', ad_type: 'Iteration', priority: 'Medium',
    format: 'Static Ad', content_source: 'Internal Team', stage: 'Brief Writing',
    assigned_to: 'Sara', strategist: 'Sara', ad_spend: 0,
    revision_round: 0, max_revisions: 2,
    testing_started_at: null, stage_entered_at: d(3), created_at: d(3),
    activity_log: [
      { id: 'l6', ad_id: '3', action: 'Ad created', performed_by: 'Sara', note: null, created_at: d(3) },
    ],
  },
  {
    id: '4', title: 'Comparison Native Ad', ad_type: 'New Concept', priority: 'Low',
    format: 'Native Ad', content_source: 'AI Generated', stage: 'Ad Revision',
    assigned_to: 'Jake', strategist: 'Mia', ad_spend: 0,
    revision_round: 1, max_revisions: 2,
    testing_started_at: null, stage_entered_at: d(1), created_at: d(7),
    activity_log: [
      { id: 'l7', ad_id: '4', action: 'Brief written',        performed_by: 'Mia',     note: null, created_at: d(7) },
      { id: 'l8', ad_id: '4', action: 'Revision requested',   performed_by: 'Founder', note: 'Rewrite CTA', created_at: d(1) },
    ],
  },
  {
    id: '5', title: 'Testimonial Carousel', ad_type: 'Iteration', priority: 'High',
    format: 'Static Ad', content_source: 'UGC Creator', stage: 'Pending Upload',
    assigned_to: 'Tom', strategist: 'Sara', ad_spend: 0,
    revision_round: 0, max_revisions: 2,
    testing_started_at: null, stage_entered_at: d(1), created_at: d(5),
    activity_log: [
      { id: 'l9',  ad_id: '5', action: 'Brief written', performed_by: 'Sara',    note: null, created_at: d(5) },
      { id: 'l10', ad_id: '5', action: 'Approved',      performed_by: 'Founder', note: null, created_at: d(1) },
    ],
  },
  {
    id: '6', title: 'Discount Urgency Hook', ad_type: 'New Concept', priority: 'Medium',
    format: 'Video Ad', content_source: 'Internal Team', stage: 'Winner',
    assigned_to: 'Jake', strategist: 'Sara', ad_spend: 3400,
    revision_round: 1, max_revisions: 2,
    testing_started_at: d(25), stage_entered_at: d(2), created_at: d(22),
    activity_log: [
      { id: 'l11', ad_id: '6', action: 'Marked Winner', performed_by: 'Founder', note: null, created_at: d(2) },
    ],
  },
  {
    id: '7', title: 'Product Demo Reel', ad_type: 'New Concept', priority: 'Medium',
    format: 'Video Ad', content_source: 'Internal Team', stage: 'Idea',
    assigned_to: 'Sara', strategist: 'Sara', ad_spend: 0,
    revision_round: 0, max_revisions: 2,
    testing_started_at: null, stage_entered_at: d(1), created_at: d(1),
    activity_log: [
      { id: 'l12', ad_id: '7', action: 'Ad created', performed_by: 'Sara', note: null, created_at: d(1) },
    ],
  },
  {
    id: '8', title: 'Before/After Static', ad_type: 'Iteration', priority: 'Low',
    format: 'Static Ad', content_source: 'AI Generated', stage: 'Loser',
    assigned_to: 'Jake', strategist: 'Mia', ad_spend: 890,
    revision_round: 0, max_revisions: 2,
    testing_started_at: d(18), stage_entered_at: d(3), created_at: d(20),
    activity_log: [
      { id: 'l13', ad_id: '8', action: 'Marked Loser', performed_by: 'Founder', note: null, created_at: d(3) },
    ],
  },
  {
    id: '9', title: 'Social Proof Bundle', ad_type: 'Iteration', priority: 'High',
    format: 'Video Ad', content_source: 'UGC Creator', stage: 'Brief Review',
    assigned_to: 'Founder', strategist: 'Sara', ad_spend: 0,
    revision_round: 0, max_revisions: 2,
    testing_started_at: null, stage_entered_at: d(1), created_at: d(4),
    activity_log: [
      { id: 'l14', ad_id: '9', action: 'Brief written',       performed_by: 'Sara', note: null, created_at: d(4) },
      { id: 'l15', ad_id: '9', action: 'Sent for review',     performed_by: 'Sara', note: null, created_at: d(1) },
    ],
  },
]

export const SEED_IDEAS = [
  { id: 'i1', description: "Test a 'myth vs truth' hook angle", submitted_by: 'Founder', tag: 'Angle to Test', promoted: false, created_at: d(5) },
  { id: 'i2', description: 'Iterate on summer sale video with a longer hook', submitted_by: 'Sara', tag: 'Iteration', promoted: false, created_at: d(3) },
  { id: 'i3', description: 'Try a carousel native ad format for Q2', submitted_by: 'Jake', tag: 'New Concept', promoted: false, created_at: d(2) },
]

export const SEED_LEARNINGS = [
  {
    id: 'learn1', ad_id: '6', ad_title: 'Discount Urgency Hook', result: 'Winner',
    insight: '3-second hook with a price reveal drove 2x CTR vs control. Direct urgency language outperformed lifestyle imagery. Keep video hooks under 4 seconds.',
    logged_by: 'Founder', created_at: d(2),
  },
  {
    id: 'learn2', ad_id: '8', ad_title: 'Before/After Static', result: 'Loser',
    insight: 'Static before/after format underperformed — audience already familiar with format. Try video or add a testimonial overlay for social proof layer.',
    logged_by: 'Sara', created_at: d(3),
  },
]
