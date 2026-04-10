import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

const normalizeSocketUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl

  let normalized = rawUrl.trim().replace(/\/$/, '')

  // If API URL was pasted here by mistake, drop API suffix and keep origin.
  normalized = normalized.replace(/\/api\/v\d+$/i, '')

  // If transport path was pasted here, drop it so socket connects to root namespace.
  normalized = normalized.replace(/\/socket\.io$/i, '')

  return normalized
}

export const useSocket = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!accessToken) return
    if (socketRef.current?.connected) return

    const socketUrl = normalizeSocketUrl(import.meta.env.VITE_SOCKET_URL)
    if (!socketUrl) {
      console.error('[CartCrew] VITE_SOCKET_URL is not set')
      return
    }

    const s = io(socketUrl, {
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