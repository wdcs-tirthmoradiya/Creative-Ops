export default function EmptyState({ text = 'Nothing here yet.' }) {
  return (
    <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted text-sm">
      {text}
    </div>
  )
}
