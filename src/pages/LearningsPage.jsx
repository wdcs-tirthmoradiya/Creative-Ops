import { useState } from 'react'
import { format } from 'date-fns'
import { useLearnings } from '@/hooks/useLearnings'
import { useAds } from '@/hooks/useAds'
import { useAppStore } from '@/store/useAppStore'
import { LEARNING_RESULTS, RESULT_COLOR } from '@/lib/constants'
import EmptyState from '@/components/shared/EmptyState'
import Badge from '@/components/shared/Badge'

const RESULT_BG = {
  Winner:      '#EAF3DE',
  Loser:       '#FCEBEB',
  Inconclusive:'#FAEEDA',
}

export default function LearningsPage() {
  const { learnings, createLearning } = useLearnings()
  const { ads }     = useAds()
  const activeUser  = useAppStore((s) => s.activeUser)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ad_id: '', ad_title: '', result: 'Winner', insight: '' })

  const completedAds = ads.filter((a) => ['Winner', 'Loser'].includes(a.stage))

  const handleSave = () => {
    if (!form.insight.trim()) return
    createLearning.mutate(form)
    setForm({ ad_id: '', ad_title: '', result: 'Winner', insight: '' })
    setShowForm(false)
  }

  const handleAdSelect = (adId) => {
    const ad = ads.find((a) => a.id === adId)
    setForm((f) => ({ ...f, ad_id: adId, ad_title: ad?.title || '' }))
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">Creative Learnings</h1>
          <p className="text-xs text-muted mt-0.5">What worked, what didn't — the team's knowledge base</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          + Log Learning
        </button>
      </div>

      {/* New learning form */}
      {showForm && (
        <div className="bg-surface-2 border border-brand/40 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-muted mb-1">Ad (optional)</label>
              <select
                value={form.ad_id}
                onChange={(e) => handleAdSelect(e.target.value)}
                className="select w-full"
              >
                <option value="">Select an ad…</option>
                {ads.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Result</label>
              <select
                value={form.result}
                onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
                className="select w-full"
              >
                {LEARNING_RESULTS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <textarea
            value={form.insight}
            onChange={(e) => setForm((f) => ({ ...f, insight: e.target.value }))}
            placeholder="What worked or didn't, and why…"
            className="input resize-none h-28 mb-3 w-full"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!form.insight.trim()}
              className="btn-primary disabled:opacity-40"
            >
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Learnings list */}
      {learnings.length === 0 ? (
        <EmptyState text="No learnings logged yet. After testing an ad, log what you discovered here." />
      ) : (
        <div className="flex flex-col gap-4">
          {learnings.map((l) => (
            <div
              key={l.id}
              className="bg-surface-2 border border-border rounded-xl p-5"
              style={{ borderLeft: `4px solid ${RESULT_COLOR[l.result] || '#888780'}` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {l.ad_title && (
                    <span className="text-sm font-bold text-white">{l.ad_title}</span>
                  )}
                  <Badge color={RESULT_COLOR[l.result]}>{l.result}</Badge>
                </div>
                <span className="text-xs text-muted shrink-0">
                  {format(new Date(l.created_at), 'MMM d, yyyy')} · {l.logged_by}
                </span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">{l.insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
