const jwt = require('jsonwebtoken')

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('Authentication required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch (err) {
    // Do not log error details — JWT error messages can aid attackers
    next(new Error('Invalid token'))
  }
}

module.exports = socketAuth