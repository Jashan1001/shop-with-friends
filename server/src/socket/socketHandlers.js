const { Server } = require('socket.io')
const socketAuth = require('./socketAuth')
const Room = require('../models/Room')

let io

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
    maxHttpBufferSize: 1e6, // 1MB max message size
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
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

module.exports = { initSocket, getIO }