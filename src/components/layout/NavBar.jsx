import { NavLink } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { TEAM, ROLES } from '@/lib/constants'

const NAV_ITEMS = [
  { to: '/pipeline',  label: 'Pipeline'  },
  { to: '/dashboard', label: 'My Board'  },
  { to: '/team',      label: 'Team View' },
  { to: '/reports',   label: 'Reports'   },
  { to: '/ideas',     label: 'Ideas'     },
  { to: '/learnings', label: 'Learnings' },
]

const ROLE_COLOR = {
  Strategist: 'bg-brand/20 text-brand',
  Editor:     'bg-be/20 text-[#1D9E75]',
  VA:         'bg-amber-900/20 text-amber-400',
  Manager:    'bg-purple-900/20 text-purple-300',
}

export default function NavBar() {
  const activeUser    = useAppStore((s) => s.activeUser)
  const setActiveUser = useAppStore((s) => s.setActiveUser)
  const role          = ROLES[activeUser]

  return (
    <header className="bg-surface border-b border-border h-14 flex items-center px-4 gap-0 shrink-0 sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-6 shrink-0">
        <span className="text-brand text-lg">◆</span>
        <span className="font-bold text-base text-white tracking-tight hidden sm:block">CreativeOps</span>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-0 flex-1 overflow-x-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 h-14 flex items-center text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'text-brand border-brand'
                  : 'text-muted border-transparent hover:text-text-primary'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User selector */}
      <div className="flex items-center gap-3 ml-4 shrink-0">
        <select
          value={activeUser}
          onChange={(e) => setActiveUser(e.target.value)}
          className="select text-sm py-1.5 px-2 w-auto"
        >
          {TEAM.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLOR[role] || 'bg-surface-3 text-muted'}`}>
          {role}
        </div>
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
          {activeUser[0]}
        </div>
      </div>
    </header>
  )
}
