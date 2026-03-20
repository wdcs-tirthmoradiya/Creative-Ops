import { STAGE_COLOR } from '@/lib/constants'
import AdCard from './AdCard'
import EmptyState from '@/components/shared/EmptyState'

export default function StageColumn({ stage, ads }) {
  return (
    <div className="flex-shrink-0 w-[220px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: STAGE_COLOR[stage] }}
        >
          {stage}
        </span>
        <span className="bg-surface-3 text-muted text-[10px] rounded-full px-2 py-0.5">
          {ads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {ads.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg py-6 text-center text-muted text-xs">
            Empty
          </div>
        ) : (
          ads.map((ad) => <AdCard key={ad.id} ad={ad} />)
        )}
      </div>
    </div>
  )
}
