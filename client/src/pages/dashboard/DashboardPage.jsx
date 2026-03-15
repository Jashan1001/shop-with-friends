import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, LogOut, Zap, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getRooms } from '../../api/rooms.api'
import { logout } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import RoomCard from '../../components/rooms/RoomCard'
import CreateRoomModal from '../../components/rooms/CreateRoomModal'
import { RoomCardSkeleton } from '../../components/ui/Skeleton'
import { stagger, slideUp } from '../../animations/variants'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { user, logout: storeLogout } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms().then((res) => res.data.rooms),
  })

  const handleLogout = async () => {
    try { await logout() } finally {
      storeLogout()
      window.location.href = '/login'
    }
  }

  const handleRoomCreated = (newRoom) => {
    queryClient.setQueryData(['rooms'], (old) => [newRoom, ...(old || [])])
    toast.success('Room created!')
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Black navbar */}
      <div className="bg-black border-b-[2.5px] border-black px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow border-[2px] border-yellow/50 flex items-center justify-center">
            <span className="font-display text-sm font-black text-black">C</span>
          </div>
          <span className="font-display text-xl font-bold text-white">CartCrew</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 font-mono text-xs text-white/60 hover:text-white transition-colors"
          >
            <div className="w-7 h-7 bg-yellow border-[2px] border-yellow/50 flex items-center justify-center">
              <span className="font-mono text-[10px] font-bold text-black">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            @{user?.username}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-body text-sm border-[2.5px] border-white/20 text-white/70 px-3 py-1.5 hover:bg-coral hover:text-white hover:border-coral transition-colors"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Your Rooms</h1>
            <p className="font-body text-muted mt-1 flex items-center gap-2">
              <Zap size={13} className="text-yellow" />
              {data?.length || 0} room{data?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-5 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow"
          >
            <Plus size={16} />
            New Room
          </button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <RoomCardSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <div className="font-mono text-sm text-coral">Failed to load rooms.</div>
        )}

        {!isLoading && data?.length === 0 && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="border-[2.5px] border-black bg-white shadow-brut p-16 text-center"
          >
            <div className="w-16 h-16 bg-yellow border-[2.5px] border-black mx-auto flex items-center justify-center mb-6">
              <ShoppingCart size={28} className="text-black" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">No rooms yet</h2>
            <p className="font-body text-muted mb-6 max-w-sm mx-auto">
              Create your first room and invite friends to shop together.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-6 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow"
            >
              Create your first room
            </button>
          </motion.div>
        )}

        {!isLoading && data?.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </motion.div>
        )}
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRoomCreated}
        />
      )}
    </div>
  )
}