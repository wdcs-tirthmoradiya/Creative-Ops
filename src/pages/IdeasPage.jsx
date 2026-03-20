import { useState } from 'react'
import { format } from 'date-fns'
import { useIdeas } from '@/hooks/useIdeas'
import { useAppStore } from '@/store/useAppStore'
import { IDEA_TAGS } from '@/lib/constants'
import EmptyState from '@/components/shared/EmptyState'
import Badge from '@/components/shared/Badge'

const TAG_COLOR = {
  'New Concept':   '#534AB7',
  'Iteration':     '#1D9E75',
  'Angle to Test': '#BA7517',
}

function IdeaCard({ idea, onPromote, onDelete }) {
  return (
    <div className="card rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Badge color={TAG_COLOR[idea.tag] || '#888780'}>{idea.tag}</Badge>
        <span className="text-[10px] text-muted shrink-0">
          {format(new Date(idea.created_at), 'MMM d')}
        </span>
      </div>

      <p className="text-sm text-text-primary leading-relaxed flex-1">{idea.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">by {idea.submitted_by}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(idea.id)}
            className="text-[11px] text-muted hover:text-[#E24B4A] transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => onPromote(idea.id)}
            className="text-[11px] bg-surface-3 border border-border-2 text-text-primary hover:border-brand rounded px-2 py-1 transition-colors"
          >
            → Promote
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IdeasPage() {
  const { ideas, createIdea, promoteIdea, deleteIdea } = useIdeas()
  const activeUser = useAppStore((s) => s.activeUser)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ description: '', tag: 'New Concept' })

  const handleSave = () => {
    if (!form.description.trim()) return
    createIdea.mutate(form)
    setForm({ description: '', tag: 'New Concept' })
    setShowForm(false)
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">Ideas Library</h1>
          <p className="text-xs text-muted mt-0.5">Capture raw ideas before they enter the pipeline</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          + Log Idea
        </button>
      </div>

      {/* New idea form */}
      {showForm && (
        <div className="bg-surface-2 border border-brand/40 rounded-xl p-5 mb-6">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe the idea…"
            className="input resize-none h-24 mb-3"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <select
              value={form.tag}
              onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
              className="select w-auto"
            >
              {IDEA_TAGS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button
              onClick={handleSave}
              disabled={!form.description.trim()}
              className="btn-primary disabled:opacity-40"
            >
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ideas grid */}
      {ideas.length === 0 ? (
        <EmptyState text="No ideas yet. Be the first to log one." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onPromote={(id) => promoteIdea.mutate(id)}
              onDelete={(id) => deleteIdea.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
