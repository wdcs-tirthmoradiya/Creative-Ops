import { useAds } from '@/hooks/useAds'
import { useAppStore } from '@/store/useAppStore'
import { TEAM, ROLES, PRIORITY_ORDER, PRIORITY_COLOR, STAGE_COLOR } from '@/lib/constants'
import { daysInStage } from '@/lib/transitions'

export default function TeamPage() {
  const { ads }         = useAds()
  const setSelectedAdId = useAppStore((s) => s.setSelectedAdId)
  const activeMembers   = TEAM.filter((t) => t !== 'Founder')
  const active          = ads.filter((a) => !['Winner', 'Loser'].includes(a.stage))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Team Workload</h1>
        <p className="text-xs text-muted mt-0.5">Live view of every active ad per team member</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeMembers.map((member) => {
          const memberAds = active
            .filter((a) => a.assigned_to === member)
            .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

          const load = memberAds.length > 3 ? 'high' : memberAds.length > 0 ? 'normal' : 'idle'

          return (
            <div key={member} className="bg-surface-2 border border-border rounded-xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-surface-3 px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {member[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{member}</p>
                    <p className="text-[10px] text-muted">{ROLES[member]}</p>
                  </div>
                </div>
                <div
                  className="text-sm font-bold px-2.5 py-1 rounded-full border"
                  style={{
                    background:   load === 'high' ? '#E24B4A22' : load === 'idle' ? '#3B6D1122' : '#26262f',
                    color:        load === 'high' ? '#E24B4A'   : load === 'idle' ? '#639922'   : '#e8e6df',
                    borderColor:  load === 'high' ? '#E24B4A44' : load === 'idle' ? '#3B6D1144' : '#3a3a45',
                  }}
                >
                  {memberAds.length}
                </div>
              </div>

              {/* Ad list */}
              <div className="flex flex-col gap-2 p-3 flex-1">
                {memberAds.length === 0 && (
                  <div className="py-6 text-center text-muted text-xs">
                    Idle — ready for work
                  </div>
                )}
                {memberAds.map((ad) => {
                  const days = daysInStage(ad)
                  const stale = days >= 5
                  return (
                    <div
                      key={ad.id}
                      onClick={() => setSelectedAdId(ad.id)}
                      className="bg-surface-3 rounded-lg px-3 py-2.5 cursor-pointer hover:border-brand/50 border border-border transition-colors"
                      style={{ borderLeft: `3px solid ${PRIORITY_COLOR[ad.priority]}` }}
                    >
                      <p className="text-xs font-semibold text-text-primary leading-snug mb-1.5 line-clamp-2">
                        {ad.title}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: STAGE_COLOR[ad.stage] }}
                        >
                          {ad.stage}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: stale ? '#E24B4A' : '#888780' }}
                        >
                          {stale && '⚠ '}{days}d
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
