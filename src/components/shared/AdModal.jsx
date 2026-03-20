import { useState } from 'react'
import { format } from 'date-fns'
import { useAds } from '@/hooks/useAds'
import { useAppStore } from '@/store/useAppStore'
import { VALID_TRANSITIONS, canMove, daysInStage, testingDaysLeft } from '@/lib/transitions'
import { PRIORITY_COLOR, STAGE_COLOR } from '@/lib/constants'
import Badge from './Badge'

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-border text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-text-primary font-medium text-right ml-4">{value}</span>
    </div>
  )
}

export default function AdModal({ ad, onClose }) {
  const [note, setNote]   = useState('')
  const { moveAd, addNote } = useAds()
  const activeUser        = useAppStore((s) => s.activeUser)
  const days              = daysInStage(ad)
  const daysLeft          = testingDaysLeft(ad)
  const transitions       = VALID_TRANSITIONS[ad.stage] || []
  const log               = [...(ad.activity_log || [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  const handleMove = (newStage) => {
    if (!canMove(ad, newStage)) return
    moveAd.mutate({ adId: ad.id, newStage })
    onClose()
  }

  const handleAddNote = () => {
    if (!note.trim()) return
    addNote.mutate({ adId: ad.id, noteText: note.trim() })
    setNote('')
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: PRIORITY_COLOR[ad.priority] }}
              />
              <h2 className="text-lg font-bold text-white truncate">{ad.title}</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge color={STAGE_COLOR[ad.stage]}>{ad.stage}</Badge>
              <Badge color={PRIORITY_COLOR[ad.priority]}>{ad.priority}</Badge>
              <Badge color="#534AB7">{ad.ad_type}</Badge>
              <Badge color="#378ADD">{ad.format}</Badge>
              <Badge color="#1D9E75">{ad.content_source}</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text-primary text-2xl leading-none shrink-0 mt-[-2px]"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">

            {/* Left — details + move */}
            <div className="p-5">
              <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-3">Details</p>
              <Row label="Assigned to" value={ad.assigned_to} />
              <Row label="Strategist"  value={ad.strategist} />
              <Row
                label="Days in stage"
                value={
                  <span style={{ color: days >= 5 ? '#E24B4A' : undefined }}>
                    {days}d{days >= 5 ? ' ⚠' : ''}
                  </span>
                }
              />
              {ad.ad_spend > 0 && (
                <Row label="Ad spend" value={`$${Number(ad.ad_spend).toLocaleString()}`} />
              )}
              {ad.stage === 'Testing' && (
                <Row
                  label="Testing progress"
                  value={
                    <span className="text-[#378ADD]">
                      {daysLeft !== null ? (daysLeft === 0 ? '✓ Unlocked' : `${daysLeft}d left 🔒`) : '—'}
                    </span>
                  }
                />
              )}
              {ad.stage === 'Ad Revision' && (
                <Row
                  label="Revision round"
                  value={
                    <span style={{ color: '#BA7517' }}>
                      {ad.revision_round} / {ad.max_revisions}
                    </span>
                  }
                />
              )}

              {transitions.length > 0 && (
                <div className="mt-5">
                  <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-2">Move to</p>
                  <div className="flex flex-col gap-2">
                    {transitions.map((next) => {
                      const ok = canMove(ad, next)
                      return (
                        <button
                          key={next}
                          disabled={!ok}
                          onClick={() => handleMove(next)}
                          className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                            ok
                              ? 'bg-surface-3 border-border-2 text-text-primary hover:border-brand cursor-pointer'
                              : 'bg-surface-2 border-border text-muted cursor-not-allowed opacity-50'
                          }`}
                        >
                          → {next}
                          {!ok && ad.stage === 'Testing' && daysLeft !== null && daysLeft > 0
                            ? ` (${daysLeft}d left)`
                            : ''}
                          {!ok && next === 'Ad Revision' && ad.revision_round >= ad.max_revisions
                            ? ' (max reached)'
                            : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right — time log */}
            <div className="p-5 flex flex-col">
              <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-3">Activity Log</p>
              <div className="flex-1 overflow-y-auto max-h-60 pr-1">
                {log.length === 0 && (
                  <p className="text-muted text-xs">No activity yet.</p>
                )}
                {log.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-border pl-3 mb-3 pb-2">
                    <p className="text-sm text-text-primary leading-snug">
                      {entry.action}
                      {entry.note && (
                        <span className="text-muted ml-1 italic">— {entry.note}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {format(new Date(entry.created_at), 'MMM d, yyyy')} · {entry.performed_by}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add note */}
              <div className="mt-4 flex gap-2">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a note…"
                  className="input flex-1 text-sm py-1.5"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!note.trim()}
                  className="btn-primary text-sm px-3 py-1.5 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
