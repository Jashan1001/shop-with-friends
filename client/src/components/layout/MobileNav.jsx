import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, User, Plus } from 'lucide-react'

export default function MobileNav({ onCreateRoom }) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Profile', icon: User, path: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-black border-t-[2.5px] border-black flex items-center lg:hidden">
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 font-mono text-[9px] uppercase tracking-widest transition-colors
              ${active ? 'text-yellow' : 'text-white/50 hover:text-white/80'}`}
          >
            <Icon size={18} />
            {label}
          </button>
        )
      })}

      {/* Center create button */}
      <button
        onClick={onCreateRoom}
        className="flex-1 flex flex-col items-center gap-1 py-3 font-mono text-[9px] uppercase tracking-widest text-yellow"
      >
        <div className="w-8 h-8 bg-yellow border-[2.5px] border-black flex items-center justify-center -mt-5">
          <Plus size={16} className="text-black" />
        </div>
        New
      </button>
    </div>
  )
}
