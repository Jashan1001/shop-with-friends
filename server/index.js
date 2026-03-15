require('dotenv').config()
const http = require('http')
const app = require('./src/app')
const connectDB = require('./src/config/db')
const { initSocket } = require('./src/socket/socketHandlers')

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  const server = http.createServer(app)
  initSocket(server)
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})