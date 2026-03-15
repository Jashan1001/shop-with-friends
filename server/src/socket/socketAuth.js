const jwt = require('jsonwebtoken')

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token
  console.log('Socket auth attempt, token:', token ? 'present' : 'missing')

  if (!token) {
    return next(new Error('Authentication required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch (err) {
    console.log('Socket auth failed:', err.message)
    next(new Error('Invalid token'))
  }
}

module.exports = socketAuth