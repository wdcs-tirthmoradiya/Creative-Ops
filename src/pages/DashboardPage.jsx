import { useAds } from '@/hooks/useAds'
import { useAppStore } from '@/store/useAppStore'
import { ROLES, PRIORITY_ORDER, PRIORITY_COLOR, STAGE_COLOR } from '@/lib/constants'
import { daysInStage } from '@/lib/transitions'
import AdCard from '@/components/pipeline/AdCard'
import EmptyState from '@/components/shared/EmptyState'

function StrategistDash({ user, ads }) {
  const myAds = ads
    .filter((a) => a.strategist === user && ['Idea','Brief Writing','Brief Review','Ad Revision'].includes(a.stage))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  return <DashSection title={`${user}'s Brief Queue`} subtitle="Sorted by priority — write, review, revise" ads={myAds} showMoveButtons />
}

function EditorDash({ user, ads }) {
  const myAds = ads
    .filter((a) => a.assigned_to === user && ['Ad Creation','Ad Review','Ad Revision'].includes(a.stage))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  return <DashSection title={`${user}'s Edit Queue`} subtitle="Sorted by priority — create, review, revise" ads={myAds} showMoveButtons />
}

function VADash({ ads }) {
  const myAds = ads.filter((a) => a.stage === 'Pending Upload')
  return <DashSection title="Pending Upload Queue" subtitle="All ads ready to be uploaded" ads={myAds} showMoveButtons />
}

function ManagerDash({ ads }) {
  const setSelectedAdId = useAppStore((s) => s.setSelectedAdId)
  const activeMembers   = ['Sara','Jake','Mia','Tom']
  const active          = ads.filter((a) => !['Winner','Loser'].includes(a.stage))
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Team Overview</h2>
        <p className="text-xs text-muted mt-0.5">All active ads by team member</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeMembers.map((member) => {
          const memberAds = active.filter((a) => a.assigned_to === member).sort((a,b) => PRIORITY_ORDER[a.priority]-PRIORITY_ORDER[b.priority])
          const load = memberAds.length > 3 ? 'high' : memberAds.length > 0 ? 'normal' : 'idle'
          return (
            <div key={member} className="bg-surface-2 border border-border rounded-xl overflow-hidden">
              <div className="bg-surface-3 px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-white">{member[0]}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{member}</p>
                    <p className="text-[10px] text-muted">{ROLES[member]}</p>
                  </div>
                </div>
                <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: load==='high'?'#E24B4A22':load==='idle'?'#3B6D1122':'#26262f', color: load==='high'?'#E24B4A':load==='idle'?'#639922':'#e8e6df' }}>
                  {memberAds.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {memberAds.length === 0 && <p className="text-xs text-muted text-center py-4">Idle — ready for work</p>}
                {memberAds.map((ad) => {
                  const days = daysInStage(ad)
                  return (
                    <div key={ad.id} onClick={() => setSelectedAdId(ad.id)} className="bg-surface-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-surface-2 transition-colors" style={{ borderLeft: `3px solid ${PRIORITY_COLOR[ad.priority]}` }}>
                      <p className="text-xs font-semibold text-text-primary leading-snug mb-1 line-clamp-2">{ad.title}</p>
                      <div className="flex justify-between">
                        <span className="text-[10px]" style={{ color: STAGE_COLOR[ad.stage] }}>{ad.stage}</span>
                        <span className="text-[10px]" style={{ color: days>=5?'#E24B4A':'#888780' }}>{days>=5&&'⚠ '}{days}d</span>
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

function DashSection({ title, subtitle, ads, showMoveButtons }) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-xs text-muted mt-0.5">{subtitle} · {ads.length} items</p>
      </div>
      {ads.length === 0
        ? <EmptyState text="Your queue is clear — nothing to action right now." />
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {ads.map((ad) => <AdCard key={ad.id} ad={ad} showMoveButtons={showMoveButtons} />)}
          </div>
      }
    </div>
  )
}

export default function DashboardPage() {
  const activeUser = useAppStore((s) => s.activeUser)
  const { ads }    = useAds()
  const role       = ROLES[activeUser]
  if (role === 'Manager')    return <ManagerDash ads={ads} />
  if (role === 'Strategist') return <StrategistDash user={activeUser} ads={ads} />
  if (role === 'Editor')     return <EditorDash user={activeUser} ads={ads} />
  if (role === 'VA')         return <VADash ads={ads} />
  return <ManagerDash ads={ads} />
}
