import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRooms } from '../../api/rooms.api'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import CreateRoomModal from '../rooms/CreateRoomModal'
import toast from 'react-hot-toast'

export default function AppLayout({ children }) {
  const [showCreate, setShowCreate] = useState(false)
  const queryClient = useQueryClient()

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms().then((r) => r.data.rooms),
    staleTime: 60_000,
  })

  const handleRoomCreated = (newRoom) => {
    queryClient.setQueryData(['rooms'], (old) => [newRoom, ...(old || [])])
    toast.success('Room created!')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar rooms={rooms} onCreateRoom={() => setShowCreate(true)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <MobileNav onCreateRoom={() => setShowCreate(true)} />

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
        />
      )}
    </div>
  )
}
