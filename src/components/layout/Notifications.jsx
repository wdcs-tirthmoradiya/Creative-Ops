import { useAppStore } from '@/store/useAppStore'

const TYPE_STYLE = {
  info:    'bg-[#1a1a2e] border-brand/60 text-text-primary',
  success: 'bg-[#0a1f0a] border-[#3B6D11]/60 text-[#9fe1cb]',
  warning: 'bg-[#2a1f00] border-[#BA7517]/60 text-[#FAC775]',
  error:   'bg-[#2a0a0a] border-[#A32D2D]/60 text-[#F7C1C1]',
}

export default function Notifications() {
  const notifications   = useAppStore((s) => s.notifications)
  const dismiss         = useAppStore((s) => s.dismissNotification)

  if (!notifications.length) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border text-sm max-w-xs shadow-2xl animate-fade-in ${TYPE_STYLE[n.type] || TYPE_STYLE.info}`}
        >
          <span className="flex-1">{n.msg}</span>
          <button
            onClick={() => dismiss(n.id)}
            className="text-current opacity-50 hover:opacity-100 text-lg leading-none mt-[-1px]"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
