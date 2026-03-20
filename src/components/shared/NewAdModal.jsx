import { useState } from 'react'
import { useAds } from '@/hooks/useAds'
import { TEAM, FORMATS, AD_TYPES, PRIORITIES, CONTENT_SOURCES, ROLES } from '@/lib/constants'

const strategists = TEAM.filter((t) => ['Strategist', 'Manager'].includes(ROLES[t]))
const editors     = TEAM.filter((t) => ['Editor'].includes(ROLES[t]))

const INIT = {
  title:          '',
  ad_type:        'New Concept',
  priority:       'High',
  format:         'Video Ad',
  content_source: 'Internal Team',
  assigned_to:    editors[0] || 'Jake',
  strategist:     strategists[0] || 'Sara',
}

export default function NewAdModal({ onClose }) {
  const [form, setForm] = useState(INIT)
  const { createAd }    = useAds()

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) return
    createAd.mutate(form)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl w-full max-w-md border border-border-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-base font-bold text-white">New Ad</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary text-2xl leading-none">×</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ad title…"
              className="input"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'ad_type',        label: 'Type',        opts: AD_TYPES },
              { key: 'priority',       label: 'Priority',    opts: PRIORITIES },
              { key: 'format',         label: 'Format',      opts: FORMATS },
              { key: 'content_source', label: 'Source',      opts: CONTENT_SOURCES },
              { key: 'assigned_to',    label: 'Assigned to', opts: TEAM.filter((t) => t !== 'Founder') },
              { key: 'strategist',     label: 'Strategist',  opts: strategists },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">{label}</label>
                <select
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="select w-full"
                >
                  {opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={!form.title.trim() || createAd.isPending}
              className="btn-primary flex-1 disabled:opacity-40"
            >
              {createAd.isPending ? 'Creating…' : 'Create Ad'}
            </button>
            <button onClick={onClose} className="btn-ghost px-4">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
