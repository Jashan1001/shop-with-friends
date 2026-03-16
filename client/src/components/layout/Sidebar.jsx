import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/auth.api'
import Avatar from '../ui/Avatar'
import { LayoutDashboard, Settings, LogOut, ShoppingCart, Plus } from 'lucide-react'

export default function Sidebar({ rooms = [], onCreateRoom }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout: storeLogout } = useAuthStore()

  const handleLogout = async () => {
    try { await logout() } finally {
      storeLogout()
      window.location.href = '/login'
    }
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  ]

  return (
    <div className="w-60 flex-shrink-0 bg-black flex flex-col h-full border-r-[2.5px] border-black">

      {/* Logo */}
      <div className="p-5 border-b-[2px] border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-yellow border-[2px] border-yellow/30 flex items-center justify-center">
            <span className="font-display text-sm font-black text-black">C</span>
          </div>
          <span className="font-display text-lg font-bold text-white">CartCrew</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="p-3 border-b-[2px] border-white/10">
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors font-body text-sm
                ${active
                  ? 'bg-yellow text-black font-bold'
                  : 'text-white/75 hover:text-white hover:border hover:border-yellow/30 hover:bg-yellow/10'
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Rooms section */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/35">
            Rooms
          </span>
        </div>

        {rooms.map((room) => {
          const active = location.pathname === `/room/${room._id}`
          return (
            <button
              key={room._id}
              onClick={() => navigate(`/room/${room._id}`)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors font-body text-sm truncate
                ${active
                  ? 'bg-yellow text-black font-bold'
                  : 'text-white/75 hover:text-white hover:bg-yellow/10'
                }`}
            >
              <ShoppingCart size={13} className="flex-shrink-0" />
              <span className="truncate">{room.name}</span>
            </button>
          )
        })}

        {/* New room button */}
        <button
          onClick={onCreateRoom}
          className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 font-body text-sm text-white/40 hover:text-white/70 border border-dashed border-white/20 transition-colors"
        >
          <Plus size={13} />
          New Room
        </button>
      </div>

      {/* Footer */}
      <div className="border-t-[2px] border-white/10 p-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-2.5 px-2 py-2 hover:bg-white/5 transition-colors"
        >
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0 flex-1 text-left">
            <div className="font-body text-xs text-white truncate">{user?.name}</div>
            <div className="font-mono text-[10px] text-white/40 truncate">@{user?.username}</div>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 font-body text-xs text-white/40 hover:text-coral transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </div>
  )
}
