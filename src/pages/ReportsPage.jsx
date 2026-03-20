import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useAds } from '@/hooks/useAds'
import { useMetrics } from '@/hooks/useMetrics'
import { CHART_COLORS } from '@/lib/constants'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1f1f28', border: '1px solid #2a2a35', borderRadius: 8, fontSize: 12 },
  labelStyle:   { color: '#e8e6df' },
  itemStyle:    { color: '#888780' },
}

function ReportCard({ title, children, span = 1 }) {
  return (
    <div
      className="bg-surface-2 border border-border rounded-xl p-5"
      style={{ gridColumn: span === 2 ? 'span 2' : undefined }}
    >
      <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-5">{title}</p>
      {children}
    </div>
  )
}

export default function ReportsPage() {
  const { ads }   = useAds()
  const m         = useMetrics(ads)

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Creative Output Report</h1>
        <p className="text-xs text-muted mt-0.5">All charts pull live from the database</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 1. Output over time */}
        <ReportCard title="Output over time (weekly)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={m.weeks} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#534AB7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>

        {/* 2. New vs Iterations */}
        <ReportCard title="New concepts vs iterations (this week)">
          <div className="flex gap-4 mb-4">
            {[
              { label: 'New Concepts', value: m.newConcepts, color: '#534AB7' },
              { label: 'Iterations',   value: m.iterations,  color: '#1D9E75' },
            ].map((item) => (
              <div key={item.label} className="flex-1 bg-surface-3 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="text-xs text-muted">{item.label}</div>
              </div>
            ))}
          </div>
          {(m.newConcepts + m.iterations) > 0 && (
            <div className="h-2 rounded-full overflow-hidden flex bg-surface-3">
              <div
                className="h-full rounded-l-full transition-all"
                style={{
                  width: `${(m.newConcepts / (m.newConcepts + m.iterations)) * 100}%`,
                  background: '#534AB7',
                }}
              />
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${(m.iterations / (m.newConcepts + m.iterations)) * 100}%`,
                  background: '#1D9E75',
                }}
              />
            </div>
          )}
        </ReportCard>

        {/* 3. Output by team member */}
        <ReportCard title="Output by team member (this week)">
          <div className="flex flex-col gap-3">
            {m.byStrategist.length === 0 && (
              <p className="text-muted text-sm text-center py-4">No data this week</p>
            )}
            {m.byStrategist.map((item, i) => {
              const max = Math.max(...m.byStrategist.map((x) => x.count), 1)
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-text-primary truncate">{item.name}</div>
                  <div className="flex-1 bg-surface-3 rounded h-5 overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${(item.count / max) * 100}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                  <div className="w-4 text-xs text-muted text-right">{item.count}</div>
                </div>
              )
            })}
          </div>
        </ReportCard>

        {/* 4. Creative diversity */}
        <ReportCard title="Creative diversity — format split (all time)">
          <div className="flex flex-col gap-3">
            {m.formats.map((f, i) => {
              const total = ads.length || 1
              const pct   = Math.round((ads.filter((a) => a.format === f.name).length / total) * 100)
              return (
                <div key={f.name} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-text-primary">{f.name.replace(' Ad', '')}</div>
                  <div className="flex-1 bg-surface-3 rounded h-5 overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${pct}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                  <div className="w-8 text-xs text-muted text-right">{pct}%</div>
                </div>
              )
            })}
          </div>
        </ReportCard>

        {/* 5. Pipeline speed */}
        <ReportCard title="Pipeline speed — avg days per stage" span={2}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {m.stageSpeed.map((s) => (
              <div
                key={s.stage}
                className="bg-surface-3 rounded-lg p-3 text-center"
                style={{ borderTop: `3px solid ${s.hot ? '#E24B4A' : '#534AB7'}` }}
              >
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: s.hot ? '#E24B4A' : '#e8e6df' }}
                >
                  {s.avg}d
                </div>
                <div className="text-[9px] text-muted leading-tight">{s.stage}</div>
                <div className="text-[9px] text-muted mt-0.5">{s.count} ads</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-3">Stages with 5+ day average are flagged red</p>
        </ReportCard>

      </div>
    </div>
  )
}
