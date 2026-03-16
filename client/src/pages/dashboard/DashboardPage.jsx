import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, ShoppingCart, Zap } from 'lucide-react'
import { getRooms } from '../../api/rooms.api'
import RoomCard from '../../components/rooms/RoomCard'
import CreateRoomModal from '../../components/rooms/CreateRoomModal'
import AppLayout from '../../components/layout/AppLayout'
import { RoomCardSkeleton } from '../../components/ui/Skeleton'
import { stagger, slideUp } from '../../animations/variants'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: rooms = [], isLoading, isError } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms().then((res) => res.data.rooms),
  })

  const handleRoomCreated = (newRoom) => {
    queryClient.setQueryData(['rooms'], (old) => [newRoom, ...(old || [])])
    toast.success('Room created!')
  }

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold">Your Rooms</h1>
            <p className="font-body text-muted mt-1 flex items-center gap-2 text-sm">
              <Zap size={13} className="text-yellow" />
              {rooms.length} room{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-4 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <Plus size={15} />
            New Room
          </button>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <RoomCardSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <p className="font-mono text-sm text-coral">Failed to load rooms.</p>
        )}

        {/* Empty state */}
        {!isLoading && rooms.length === 0 && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="border-[2.5px] border-black border-dashed bg-white p-16 text-center"
          >
            <div className="w-16 h-16 bg-yellow border-[2.5px] border-black mx-auto flex items-center justify-center mb-5 shadow-brut">
              <ShoppingCart size={28} className="text-black" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">No rooms yet</h2>
            <p className="font-body text-muted mb-6 max-w-sm mx-auto text-sm">
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

        {/* Rooms grid */}
        {!isLoading && rooms.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {rooms.map((room) => (
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
    </AppLayout>
  )
}
