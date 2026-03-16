const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Guard: fail fast with a clear message if env is not configured
if (!process.env.MONGODB_URI && !process.env.MONGODB_URI_TEST) {
  throw new Error(
    'Tests require MONGODB_URI or MONGODB_URI_TEST in server/.env\n' +
    'Create server/.env from server/.env.example and fill in your test DB URI'
  )
}

// __tests__/setup.js
// Shared test setup: connect to a real MongoDB test DB, clean up after each suite

const mongoose = require('mongoose')

// Use a separate test database — never the production URI
const TEST_DB = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI

beforeAll(async () => {
  await mongoose.connect(TEST_DB)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

afterEach(async () => {
  // Clear all collections between tests for isolation
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})
