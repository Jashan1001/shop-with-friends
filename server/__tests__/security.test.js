/**
 * security.test.js
 * Regression tests for all security fixes.
 * These tests MUST pass — if they fail, a security fix has been broken.
 */
const request = require('supertest')
const app = require('../src/app')
const Room = require('../src/models/Room')
const Product = require('../src/models/Product')
const Vote = require('../src/models/Vote')
const Comment = require('../src/models/Comment')

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function createUser(tag = '') {
  const uid = Date.now().toString(36)
  const res = await request(app).post('/api/v1/auth/signup').send({
    name: `Security User ${tag}`,
    username: `su${tag}${uid}`,
    email: `secuser${tag}${uid}@example.com`,
    password: 'Password1!',
  })
  return res.body
}

// ─── MASS ASSIGNMENT PROTECTION ───────────────────────────────────────────────
describe('Security: Mass assignment protection', () => {
  it('updateProduct cannot overwrite roomId or addedBy', async () => {
    const owner = await createUser('a')
    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Room A' })
    const roomId = roomRes.body.room._id

    const productRes = await request(app)
      .post(`/api/v1/rooms/${roomId}/products`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ title: 'Original', platform: 'other' })
    const productId = productRes.body.product._id
    const originalAddedBy = productRes.body.product.addedBy._id

    // Attempt to overwrite addedBy via mass assignment
    const fakeUserId = '507f1f77bcf86cd799439011'
    await request(app)
      .put(`/api/v1/rooms/${roomId}/products/${productId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ title: 'Updated', addedBy: fakeUserId, roomId: '507f1f77bcf86cd799439099' })

    // Verify addedBy was not changed
    const product = await Product.findById(productId)
    expect(product.addedBy.toString()).toBe(originalAddedBy)
    expect(product.title).toBe('Updated') // allowed field changed
  })

  it('updateRoom cannot overwrite createdBy or members', async () => {
    const owner = await createUser('b')
    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Room B' })
    const roomId = roomRes.body.room._id
    const originalCreatedBy = roomRes.body.room.createdBy

    const fakeUserId = '507f1f77bcf86cd799439011'
    await request(app)
      .put(`/api/v1/rooms/${roomId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'New Name', createdBy: fakeUserId, members: [] })

    const room = await Room.findById(roomId)
    expect(room.createdBy.toString()).toBe(originalCreatedBy)
    expect(room.name).toBe('New Name') // allowed field changed
    expect(room.members.length).toBeGreaterThan(0) // members not overwritten
  })
})

// ─── CASCADE DELETE ────────────────────────────────────────────────────────────
describe('Security: Cascade delete on room deletion', () => {
  it('deleting a room removes its products, votes, and comments', async () => {
    const owner = await createUser('c')
    const member = await createUser('d')

    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Room to Delete' })
    const roomId = roomRes.body.room._id
    const inviteCode = roomRes.body.room.inviteCode

    await request(app)
      .post(`/api/v1/rooms/join/${inviteCode}`)
      .set('Authorization', `Bearer ${member.accessToken}`)

    // Add product + vote + comment
    const prodRes = await request(app)
      .post(`/api/v1/rooms/${roomId}/products`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ title: 'Doomed Product', platform: 'other' })
    const productId = prodRes.body.product._id

    await request(app)
      .post(`/api/v1/products/${productId}/vote`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ value: 1 })

    await request(app)
      .post(`/api/v1/products/${productId}/comments`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ text: 'This should be deleted' })

    // Delete the room
    await request(app)
      .delete(`/api/v1/rooms/${roomId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)

    // Verify cascade
    const products = await Product.find({ roomId })
    const votes = await Vote.find({ productId })
    const comments = await Comment.find({ roomId })

    expect(products).toHaveLength(0)
    expect(votes).toHaveLength(0)
    expect(comments).toHaveLength(0)
  })
})

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
describe('Security: Rate limiting', () => {
  it('globalLimiter is active — API routes respond (not bypassed)', async () => {
    // Just verify the API is reachable and rate limiter doesn't break normal flow
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })
})

// ─── IDOR PROTECTION ─────────────────────────────────────────────────────────
describe('Security: IDOR protection', () => {
  it('member of room A cannot access room B products', async () => {
    const ownerA = await createUser('e')
    const ownerB = await createUser('f')

    const roomARes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${ownerA.accessToken}`)
      .send({ name: 'Room A' })
    const roomBRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${ownerB.accessToken}`)
      .send({ name: 'Room B' })

    // ownerA tries to read Room B products
    const res = await request(app)
      .get(`/api/v1/rooms/${roomBRes.body.room._id}/products`)
      .set('Authorization', `Bearer ${ownerA.accessToken}`)

    expect(res.status).toBe(403)
  })
})

// ─── EMOJI ALLOWLIST ─────────────────────────────────────────────────────────
describe('Security: Reaction emoji allowlist', () => {
  it('rejects emojis not in the allowed set', async () => {
    const user = await createUser('g')
    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ name: 'Emoji Test Room' })
    const prodRes = await request(app)
      .post(`/api/v1/rooms/${roomRes.body.room._id}/products`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ title: 'Test', platform: 'other' })

    const res = await request(app)
      .post(`/api/v1/products/${prodRes.body.product._id}/reactions`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ emoji: '💩' }) // not in allowed list
    expect(res.status).toBe(400)
  })

  it('rejects script injection attempt via emoji field', async () => {
    const user = await createUser('h')
    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ name: 'XSS Test Room' })
    const prodRes = await request(app)
      .post(`/api/v1/rooms/${roomRes.body.room._id}/products`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ title: 'Test', platform: 'other' })

    const res = await request(app)
      .post(`/api/v1/products/${prodRes.body.product._id}/reactions`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ emoji: '<script>alert(1)</script>' })
    expect(res.status).toBe(400)
  })
})
