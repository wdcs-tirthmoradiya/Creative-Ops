import { useAds } from '@/hooks/useAds'
import { useMetrics } from '@/hooks/useMetrics'

function Tile({ label, value, accent }) {
  return (
    <div
      className="flex-shrink-0 bg-surface-2 rounded-lg px-4 py-2.5 min-w-[110px] snap-start"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="text-[10px] text-muted uppercase tracking-widest mb-1 whitespace-nowrap">{label}</div>
      <div className="text-xl font-bold" style={{ color: accent }}>{value}</div>
    </div>
  )
}

export default function MetricsBar() {
  const { ads } = useAds()
  const m       = useMetrics(ads)

  const totalSpend = Object.values(m.spendByEditor).reduce((s, v) => s + v, 0)

  return (
    <div className="bg-surface border-b border-border px-4 py-2">
      <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-0.5">
        <Tile label="Volume this week"  value={m.volume}             accent="#7F77DD" />
        <Tile label="Hit rate"          value={`${m.hitRate}%`}      accent="#639922" />
        <Tile label="Avg revisions"     value={m.avgRevisions}       accent="#BA7517" />
        <Tile label="Total ad spend"    value={`$${totalSpend.toLocaleString()}`} accent="#D85A30" />
        <Tile label="In testing"        value={m.inTesting}          accent="#185FA5" />
        <Tile label="New / Iterations"  value={`${m.newConcepts}/${m.iterations}`} accent="#1D9E75" />
        <Tile label="Avg days → upload" value={`${m.avgDaysToUpload}d`} accent="#378ADD" />
        <Tile label="Video / Static / Native" value={m.formats.map((f) => f.count).join('/')} accent="#534AB7" />
      </div>
    </div>
  )
}
