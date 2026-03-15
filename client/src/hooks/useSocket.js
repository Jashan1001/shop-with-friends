import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

export const useSocket = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const { socket, setSocket } = useSocketStore()

  useEffect(() => {
    if (!accessToken) return
    if (socket?.connected) return

    // Disconnect any existing stale socket instance before reconnecting
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }

    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    s.on('connect', () => {
      console.log('Socket connected:', s.id)
    })
    s.on('connect_error', (err) => console.error('Socket error:', err.message))
    s.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
    }
  }, [accessToken, socket, setSocket])
}