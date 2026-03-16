import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRooms } from '../../api/rooms.api'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import CreateRoomModal from '../rooms/CreateRoomModal'
import toast from 'react-hot-toast'
import { useSocketStore } from '../../store/socketStore'
import { useAuthStore } from '../../store/authStore'
import { WifiOff } from 'lucide-react'

function DisconnectBanner() {
  const socket = useSocketStore((s) => s.socket)
  const { isLoggedIn } = useAuthStore()

  // Only show when logged in and socket has dropped
  if (!isLoggedIn || socket?.connected !== false) return null

  return (
    <div className="bg-coral text-white font-mono text-xs px-4 py-2 flex items-center gap-2 justify-center">
      <WifiOff size={12} />
      Reconnecting to real-time server...
    </div>
  )
}

export default function AppLayout({ children }) {
  const [showCreate, setShowCreate] = useState(false)
  const queryClient = useQueryClient()

  // Use staleTime: 0 so data is always fresh — React Query deduplicates
  // the network request if DashboardPage already fetched it
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms().then((r) => r.data.rooms),
    staleTime: 0,
  })

  const handleRoomCreated = (newRoom) => {
    queryClient.setQueryData(['rooms'], (old) => [newRoom, ...(old || [])])
    toast.success('Room created!')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-cream flex-col">
      <DisconnectBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar rooms={rooms} onCreateRoom={() => setShowCreate(true)} />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <MobileNav onCreateRoom={() => setShowCreate(true)} />
      </div>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
        />
      )}
    </div>
  )
}
