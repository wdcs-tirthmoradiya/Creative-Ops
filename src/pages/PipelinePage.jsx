import { useAds } from '@/hooks/useAds'
import { useAppStore } from '@/store/useAppStore'
import { STAGES } from '@/lib/transitions'
import StageColumn from '@/components/pipeline/StageColumn'

export default function PipelinePage() {
  const { ads, isLoading } = useAds()
  const setShowNewAdModal  = useAppStore((s) => s.setShowNewAdModal)

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white">Pipeline Board</h1>
          <p className="text-xs text-muted mt-0.5">{ads.length} ads in system</p>
        </div>
        <button
          onClick={() => setShowNewAdModal(true)}
          className="btn-primary text-sm"
        >
          + New Ad
        </button>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted text-sm">
          Loading…
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-6 min-w-max h-full items-start">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                ads={ads.filter((a) => a.stage === stage)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
