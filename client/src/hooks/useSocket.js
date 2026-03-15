import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

export const useSocket = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!accessToken) return
    if (socketRef.current?.connected) return

    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    s.on('connect', () => {
      console.log('Socket connected:', s.id)
      useSocketStore.getState().setSocket(s)
    })

    s.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
    })

    s.on('disconnect', () => {
      useSocketStore.getState().setSocket(null)
    })

    socketRef.current = s

    return () => {
      s.disconnect()
      socketRef.current = null
      useSocketStore.getState().setSocket(null)
    }
  }, [accessToken])
}