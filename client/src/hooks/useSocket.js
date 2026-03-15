import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

export const useSocket = () => {
  const { accessToken } = useAuthStore()
  const { socket, setSocket } = useSocketStore()

  useEffect(() => {
    if (!accessToken || socket) return

    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    })

    s.on('connect', () => console.log('Socket connected'))
    s.on('connect_error', (err) => console.error('Socket error:', err.message))

    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
    }
  }, [accessToken])
}