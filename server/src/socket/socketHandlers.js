const { Server } = require('socket.io')
const socketAuth = require('./socketAuth')
const Room = require('../models/Room')

let io

const normalizeOrigin = (origin) =>
  typeof origin === 'string' ? origin.trim().replace(/\/$/, '') : origin

// Origins driven by environment variables — no hardcoded production URLs
// Set CORS_ORIGINS=https://your-app.vercel.app in Railway dashboard
const allowedOrigins = [
  'http://localhost:5173',
  'https://cart-crew.vercel.app',
  process.env.CLIENT_URL || 'https://cart-crew.vercel.app',
  process.env.CORS_ORIGIN,
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]
  .map(normalizeOrigin)
  .filter(Boolean)

const cartCrewVercelPreviewRegex = /^https:\/\/cart-crew(?:-[a-z0-9-]+)*\.vercel\.app$/i

const socketCorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    const normalizedOrigin = normalizeOrigin(origin)

    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      cartCrewVercelPreviewRegex.test(normalizedOrigin)

    if (isAllowed) return callback(null, true)

    console.warn(`Blocked Socket.IO CORS origin: ${normalizedOrigin}`)
    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST'],
  credentials: true,
}

const initSocket = (server) => {
  io = new Server(server, {
    cors: socketCorsOptions,
    maxHttpBufferSize: 1e6, // 1MB max message size
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
  })

  // Auth middleware — runs before any connection is established
  io.use(socketAuth)

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId}`)

    // Join a room's socket channel
    socket.on('join:room', async (roomId) => {
      try {
        // Verify user is actually a member before letting them join
        const room = await Room.findById(roomId)
        if (!room) return

        const isMember = room.members.some(
          (id) => id.toString() === socket.userId
        )
        if (!isMember) return

        socket.join(`room:${roomId}`)
        console.log(`User ${socket.userId} joined room:${roomId}`)
      } catch (err) {
        console.error('join:room error', err.message)
      }
    })

    // Leave a room's socket channel
    socket.on('leave:room', (roomId) => {
      socket.leave(`room:${roomId}`)
      console.log(`User ${socket.userId} left room:${roomId}`)
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`)
    })
  })

  return io
}

// Export so controllers can emit events
const getIO = () => {
  if (!io) {
    if (process.env.NODE_ENV === 'test') {
      return {
        to: () => ({ emit: () => {} }),
        emit: () => {},
      }
    }
    throw new Error('Socket.io not initialized')
  }
  return io
}

module.exports = { initSocket, getIO }