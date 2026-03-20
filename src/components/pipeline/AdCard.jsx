import { useAppStore } from '@/store/useAppStore'
import { PRIORITY_COLOR, STAGE_COLOR } from '@/lib/constants'
import { daysInStage, testingDaysLeft, canMove, VALID_TRANSITIONS } from '@/lib/transitions'
import { useAds } from '@/hooks/useAds'
import Badge from '@/components/shared/Badge'

export default function AdCard({ ad, showMoveButtons = false }) {
  const setSelectedAdId = useAppStore((s) => s.setSelectedAdId)
  const { moveAd }      = useAds()
  const days            = daysInStage(ad)
  const daysLeft        = testingDaysLeft(ad)
  const stale           = days >= 5
  const transitions     = VALID_TRANSITIONS[ad.stage] || []

  return (
    <div
      onClick={() => setSelectedAdId(ad.id)}
      className="bg-surface-2 border border-border rounded-lg p-3 cursor-pointer relative overflow-hidden transition-all duration-150 hover:border-brand/60 group"
    >
      {/* Priority stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: PRIORITY_COLOR[ad.priority] }}
      />

      <div className="pl-2">
        {/* Title */}
        <p className="text-sm font-semibold text-text-primary leading-snug mb-2 line-clamp-2">
          {ad.title}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge color={ad.ad_type === 'New Concept' ? '#534AB7' : '#0F6E56'}>
            {ad.ad_type === 'New Concept' ? 'New' : 'Iter'}
          </Badge>
          <Badge color="#2a2a35">{ad.format.replace(' Ad', '')}</Badge>
        </div>

        {/* Footer row */}
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted">{ad.assigned_to}</span>
          <span
            className="text-[11px] font-medium"
            style={{ color: stale ? '#E24B4A' : '#888780' }}
          >
            {stale && '⚠ '}{days}d
          </span>
        </div>

        {/* Testing lock */}
        {daysLeft !== null && daysLeft > 0 && (
          <div className="mt-2 bg-[#0c1a2e] rounded px-2 py-1 text-[11px] text-[#378ADD]">
            🔒 {daysLeft}d remaining in testing
          </div>
        )}

        {/* Revision round */}
        {ad.stage === 'Ad Revision' && (
          <div className="mt-1 text-[11px] text-[#BA7517]">
            Round {ad.revision_round} / {ad.max_revisions}
          </div>
        )}

        {/* Inline move buttons (dashboard view) */}
        {showMoveButtons && transitions.length > 0 && (
          <div
            className="flex gap-1.5 mt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {transitions.map((next) => {
              const ok = canMove(ad, next)
              return (
                <button
                  key={next}
                  disabled={!ok || moveAd.isPending}
                  onClick={() => moveAd.mutate({ adId: ad.id, newStage: next })}
                  className={`flex-1 text-[11px] px-2 py-1 rounded border transition-all ${
                    ok
                      ? 'bg-surface-3 border-border-2 text-text-primary hover:border-brand cursor-pointer'
                      : 'bg-surface-2 border-border text-muted cursor-not-allowed opacity-40'
                  }`}
                >
                  → {next.replace('Brief ', 'B.').replace('Writing', 'Write').replace('Review', 'Rev').replace('Creation', 'Create').replace('Revision', 'Revise').replace('Pending Upload', 'Upload').replace('Testing', 'Test')}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
