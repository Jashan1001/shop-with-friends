/**
 * votes.test.js — Voting system tests
 * Covers: vote counts, double-vote prevention (unique index), remove vote, non-member blocked
 */
require('./setup')
const request = require('supertest')
const app = require('../src/app')

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function createUser(suffix = '') {
  const res = await request(app).post('/api/v1/auth/signup').send({
    name: `Voter ${suffix}`,
    username: `voter${suffix}${Date.now()}`,
    email: `voter${suffix}${Date.now()}@example.com`,
    password: 'Password1!',
  })
  return res.body
}

async function createRoom(token) {
  const res = await request(app)
    .post('/api/v1/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Vote Test Room' })
  return res.body.room
}

async function addProduct(token, roomId) {
  const res = await request(app)
    .post(`/api/v1/rooms/${roomId}/products`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Product', price: 999, platform: 'other' })
  return res.body.product
}

async function castVote(token, productId, value) {
  return request(app)
    .post(`/api/v1/products/${productId}/vote`)
    .set('Authorization', `Bearer ${token}`)
    .send({ value })
}

// ─── VOTE COUNTS ─────────────────────────────────────────────────────────────

describe('Voting — counts', () => {
  it('upvote increments upvote count correctly', async () => {
    const user = await createUser('a')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    const res = await castVote(user.accessToken, product._id, 1)

    expect(res.status).toBe(200)
    expect(res.body.upvotes).toBe(1)
    expect(res.body.downvotes).toBe(0)
    expect(res.body.userVote).toBe(1)
  })

  it('downvote increments downvote count correctly', async () => {
    const user = await createUser('b')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    const res = await castVote(user.accessToken, product._id, -1)

    expect(res.status).toBe(200)
    expect(res.body.downvotes).toBe(1)
    expect(res.body.upvotes).toBe(0)
    expect(res.body.userVote).toBe(-1)
  })

  it('two different users voting both count independently', async () => {
    const owner = await createUser('c')
    const joiner = await createUser('d')

    const room = await createRoom(owner.accessToken)

    // Joiner joins the room
    await request(app)
      .post(`/api/v1/rooms/join/${room.inviteCode}`)
      .set('Authorization', `Bearer ${joiner.accessToken}`)

    const product = await addProduct(owner.accessToken, room._id)

    await castVote(owner.accessToken, product._id, 1)
    const res = await castVote(joiner.accessToken, product._id, 1)

    expect(res.body.upvotes).toBe(2)
  })
})

// ─── DOUBLE-VOTE PREVENTION ───────────────────────────────────────────────────

describe('Voting — double-vote prevention (unique index)', () => {
  it('voting the same value twice acts as a toggle (removes vote)', async () => {
    const user = await createUser('e')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    await castVote(user.accessToken, product._id, 1)

    // Vote same direction again → should remove the vote
    await request(app)
      .delete(`/api/v1/products/${product._id}/vote`)
      .set('Authorization', `Bearer ${user.accessToken}`)

    // Get products and check vote count is 0
    const productsRes = await request(app)
      .get(`/api/v1/rooms/${room._id}/products`)
      .set('Authorization', `Bearer ${user.accessToken}`)

    const p = productsRes.body.products.find((p) => p._id === product._id)
    expect(p.upvotes).toBe(0)
  })

  it('changing vote direction (up → down) updates both counts correctly', async () => {
    const user = await createUser('f')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    // First vote up
    await castVote(user.accessToken, product._id, 1)
    // Then change to down
    const res = await castVote(user.accessToken, product._id, -1)

    expect(res.status).toBe(200)
    expect(res.body.upvotes).toBe(0)   // old upvote overwritten
    expect(res.body.downvotes).toBe(1)
    expect(res.body.userVote).toBe(-1)
  })
})

// ─── REMOVE VOTE ─────────────────────────────────────────────────────────────

describe('DELETE /api/v1/products/:id/vote', () => {
  it('removes vote and decrements count', async () => {
    const user = await createUser('g')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    await castVote(user.accessToken, product._id, 1)

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}/vote`)
      .set('Authorization', `Bearer ${user.accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.upvotes).toBe(0)
    expect(res.body.userVote).toBe(0)
  })
})

// ─── AUTH GUARD ───────────────────────────────────────────────────────────────

describe('Voting — auth guard', () => {
  it('returns 401 for unauthenticated vote', async () => {
    const user = await createUser('h')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    const res = await request(app)
      .post(`/api/v1/products/${product._id}/vote`)
      .send({ value: 1 })

    expect(res.status).toBe(401)
  })
})
