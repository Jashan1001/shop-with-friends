/**
 * reactions.test.js
 * Tests: add reaction, toggle off, two users count, invalid emoji rejected, 401 unauthenticated
 */
const request = require('supertest')
const app = require('../src/app')

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function createUser(tag = '') {
  const ts = Date.now()
  const res = await request(app).post('/api/v1/auth/signup').send({
    name: `React User ${tag}`,
    username: `rxuser${tag}${ts}`,
    email: `rxuser${tag}${ts}@example.com`,
    password: 'Password1!',
  })
  return res.body
}

async function createRoomAndProduct(ownerToken) {
  const roomRes = await request(app)
    .post('/api/v1/rooms')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Reaction Test Room' })
  const room = roomRes.body.room

  const prodRes = await request(app)
    .post(`/api/v1/rooms/${room._id}/products`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ title: 'Test Product', platform: 'other' })
  return { room, product: prodRes.body.product }
}

async function react(token, productId, emoji) {
  return request(app)
    .post(`/api/v1/products/${productId}/reactions`)
    .set('Authorization', `Bearer ${token}`)
    .send({ emoji })
}

// ─── ADD REACTION ─────────────────────────────────────────────────────────────
describe('POST /api/v1/products/:id/reactions', () => {
  it('adds a reaction and returns updated reaction list', async () => {
    const user = await createUser('a')
    const { product } = await createRoomAndProduct(user.accessToken)

    const res = await react(user.accessToken, product._id, '👍')
    expect(res.status).toBe(200)
    expect(res.body.reactions).toBeInstanceOf(Array)
    const thumbs = res.body.reactions.find((r) => r.emoji === '👍')
    expect(thumbs).toBeDefined()
    expect(thumbs.count).toBe(1)
    expect(thumbs.hasReacted).toBe(true)
  })

  it('toggling the same emoji removes the reaction (count drops to 0)', async () => {
    const user = await createUser('b')
    const { product } = await createRoomAndProduct(user.accessToken)

    // Add
    await react(user.accessToken, product._id, '❤️')
    // Remove (same emoji again = toggle off)
    const res = await react(user.accessToken, product._id, '❤️')

    expect(res.status).toBe(200)
    const heart = res.body.reactions.find((r) => r.emoji === '❤️')
    // Either not in list or count is 0
    expect(heart === undefined || heart.count === 0).toBe(true)
  })

  it('two different users reacting with same emoji gives count of 2', async () => {
    const owner = await createUser('c')
    const member = await createUser('d')
    const { room, product } = await createRoomAndProduct(owner.accessToken)

    // Member joins
    await request(app)
      .post(`/api/v1/rooms/join/${room.inviteCode}`)
      .set('Authorization', `Bearer ${member.accessToken}`)

    await react(owner.accessToken, product._id, '🔥')
    const res = await react(member.accessToken, product._id, '🔥')

    expect(res.status).toBe(200)
    const fire = res.body.reactions.find((r) => r.emoji === '🔥')
    expect(fire.count).toBe(2)
  })

  it('rejects an emoji that is not in the allowed list', async () => {
    const user = await createUser('e')
    const { product } = await createRoomAndProduct(user.accessToken)

    const res = await react(user.accessToken, product._id, '🍕')
    expect(res.status).toBe(400)
  })

  it('rejects an arbitrary string as emoji', async () => {
    const user = await createUser('f')
    const { product } = await createRoomAndProduct(user.accessToken)

    const res = await react(user.accessToken, product._id, '<script>')
    expect(res.status).toBe(400)
  })

  it('returns 401 for unauthenticated reaction', async () => {
    const user = await createUser('g')
    const { product } = await createRoomAndProduct(user.accessToken)

    const res = await request(app)
      .post(`/api/v1/products/${product._id}/reactions`)
      .send({ emoji: '👍' })
    expect(res.status).toBe(401)
  })
})

// ─── GET REACTIONS ────────────────────────────────────────────────────────────
describe('GET /api/v1/products/:id/reactions', () => {
  it('returns empty array when no reactions exist', async () => {
    const user = await createUser('h')
    const { product } = await createRoomAndProduct(user.accessToken)

    const res = await request(app)
      .get(`/api/v1/products/${product._id}/reactions`)
      .set('Authorization', `Bearer ${user.accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.reactions).toEqual([])
  })

  it('marks hasReacted correctly for the requesting user', async () => {
    const user = await createUser('i')
    const { product } = await createRoomAndProduct(user.accessToken)

    await react(user.accessToken, product._id, '😍')

    const res = await request(app)
      .get(`/api/v1/products/${product._id}/reactions`)
      .set('Authorization', `Bearer ${user.accessToken}`)

    const star = res.body.reactions.find((r) => r.emoji === '😍')
    expect(star.hasReacted).toBe(true)
  })
})
