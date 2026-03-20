export const STAGES = [
  'Idea',
  'Brief Writing',
  'Brief Review',
  'Ad Creation',
  'Ad Review',
  'Ad Revision',
  'Pending Upload',
  'Testing',
  'Winner',
  'Loser',
]

export const VALID_TRANSITIONS = {
  'Idea':           ['Brief Writing'],
  'Brief Writing':  ['Brief Review'],
  'Brief Review':   ['Ad Creation', 'Brief Writing'],
  'Ad Creation':    ['Ad Review'],
  'Ad Review':      ['Ad Revision', 'Pending Upload'],
  'Ad Revision':    ['Ad Review'],
  'Pending Upload': ['Testing'],
  'Testing':        ['Winner', 'Loser'],
  'Winner':         [],
  'Loser':          [],
}

export const TERMINAL_STAGES = ['Winner', 'Loser']

export const TESTING_LOCK_DAYS = 10

/**
 * Returns true if the move is allowed client-side.
 * The DB function enforces the same rules authoritatively.
 */
export function canMove(ad, newStage) {
  if (!VALID_TRANSITIONS[ad.stage]?.includes(newStage)) return false

  if (ad.stage === 'Testing') {
    const ms   = Date.now() - new Date(ad.testing_started_at).getTime()
    const days = Math.floor(ms / 86_400_000)
    if (days < TESTING_LOCK_DAYS) return false
  }

  if (newStage === 'Ad Revision') {
    if (ad.revision_round >= ad.max_revisions) return false
  }

  return true
}

export function testingDaysLeft(ad) {
  if (ad.stage !== 'Testing' || !ad.testing_started_at) return null
  const ms   = Date.now() - new Date(ad.testing_started_at).getTime()
  const done = Math.floor(ms / 86_400_000)
  return Math.max(0, TESTING_LOCK_DAYS - done)
}

export function daysInStage(ad) {
  const ms = Date.now() - new Date(ad.stage_entered_at).getTime()
  return Math.floor(ms / 86_400_000)
}
