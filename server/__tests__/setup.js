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
