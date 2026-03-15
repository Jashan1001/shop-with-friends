import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, LogOut } from 'lucide-react'
import { getRooms } from '../../api/rooms.api'
import { logout } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import RoomCard from '../../components/rooms/RoomCard'
import CreateRoomModal from '../../components/rooms/CreateRoomModal'
import { stagger, slideUp } from '../../animations/variants'
import { RoomCardSkeleton } from '../../components/ui/Skeleton'

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()
  const { user, logout: storeLogout } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms().then((res) => res.data.rooms),
  })

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      storeLogout()
      window.location.href = '/login'
    }
  }

  const handleRoomCreated = (newRoom) => {
    // Add new room to cache without refetching
    queryClient.setQueryData(['rooms'], (old) => [newRoom, ...(old || [])])
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Top navbar */}
      <div className="border-b-[2.5px] border-black bg-white px-8 py-4 flex items-center justify-between">
        <span className="font-display text-xl font-bold">ShopFriends</span>
        <div className="flex items-center gap-4">
          <span
            onClick={() => navigate('/profile')}
            className="font-mono text-sm text-muted cursor-pointer hover:text-black transition-colors underline"
          >
            @{user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-body text-sm border-[2.5px] border-black px-3 py-1.5 hover:bg-coral hover:text-white hover:border-coral transition-colors shadow-brut"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">
              Your Rooms
            </h1>
            <p className="font-body text-muted mt-1">
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

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="font-mono text-sm text-coral">Failed to load rooms.</div>
        )}

        {/* Empty state */}
        {!isLoading && data?.length === 0 && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="border-[2.5px] border-black border-dashed p-16 text-center"
          >
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="font-display text-2xl font-bold mb-2">No rooms yet</h2>
            <p className="font-body text-muted mb-6">
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

        {/* Room grid */}
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

      {/* Create room modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRoomCreated}
        />
      )}
    </div>
  )
}