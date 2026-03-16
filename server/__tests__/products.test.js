/**
 * products.test.js — Product CRUD tests
 * Covers: add product, non-member cannot add, edit own, cannot edit others', delete permissions
 */
const request = require('supertest')
const app = require('../src/app')

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function createUser(suffix = '') {
  const uid = Date.now().toString(36)
  const res = await request(app).post('/api/v1/auth/signup').send({
    name: `Prod User ${suffix}`,
    username: `pu${suffix}${uid}`,
    email: `produser${suffix}${uid}@example.com`,
    password: 'Password1!',
  })
  return res.body
}

async function createRoom(token) {
  const res = await request(app)
    .post('/api/v1/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Product Test Room' })
  return res.body.room
}

async function addProduct(token, roomId, overrides = {}) {
  const res = await request(app)
    .post(`/api/v1/rooms/${roomId}/products`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Product', price: 1999, platform: 'other', ...overrides })
  return res
}

// ─── ADD PRODUCT ──────────────────────────────────────────────────────────────

describe('POST /api/v1/rooms/:roomId/products', () => {
  it('allows a room member to add a product', async () => {
    const user = await createUser('a')
    const room = await createRoom(user.accessToken)

    const res = await addProduct(user.accessToken, room._id, { title: 'Sony Headphones' })

    expect(res.status).toBe(201)
    expect(res.body.product.title).toBe('Sony Headphones')
    expect(res.body.product.addedBy).toBeDefined()
  })

  it('returns 403 for a non-member trying to add a product', async () => {
    const owner = await createUser('b')
    const outsider = await createUser('c')

    const room = await createRoom(owner.accessToken)

    const res = await addProduct(outsider.accessToken, room._id)

    expect(res.status).toBe(403)
  })

  it('rejects a product with a title longer than 200 characters', async () => {
    const user = await createUser('d')
    const room = await createRoom(user.accessToken)

    const res = await addProduct(user.accessToken, room._id, { title: 'A'.repeat(201) })

    expect(res.status).toBe(400)
  })

  it('requires a title — empty title is rejected', async () => {
    const user = await createUser('e')
    const room = await createRoom(user.accessToken)

    const res = await addProduct(user.accessToken, room._id, { title: '' })

    expect(res.status).toBe(400)
  })
})

// ─── EDIT PRODUCT ─────────────────────────────────────────────────────────────

describe('PUT /api/v1/rooms/:roomId/products/:id', () => {
  it('allows the product owner to edit their product', async () => {
    const user = await createUser('f')
    const room = await createRoom(user.accessToken)
    const productRes = await addProduct(user.accessToken, room._id)
    const productId = productRes.body.product._id

    const res = await request(app)
      .put(`/api/v1/rooms/${room._id}/products/${productId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ title: 'Updated Title' })

    expect(res.status).toBe(200)
    expect(res.body.product.title).toBe('Updated Title')
  })

  it('prevents a different member from editing another member\'s product', async () => {
    const owner = await createUser('g')
    const member = await createUser('h')
    const room = await createRoom(owner.accessToken)

    // Member joins the room
    await request(app)
      .post(`/api/v1/rooms/join/${room.inviteCode}`)
      .set('Authorization', `Bearer ${member.accessToken}`)

    // Member adds a product
    const productRes = await addProduct(member.accessToken, room._id, { title: 'Member Product' })
    const productId = productRes.body.product._id

    // Owner tries to edit member's product — should be blocked (only room owner can delete, not edit)
    const res = await request(app)
      .put(`/api/v1/rooms/${room._id}/products/${productId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ title: 'Hijacked Title' })

    expect(res.status).toBe(403)
  })
})

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────

describe('DELETE /api/v1/rooms/:roomId/products/:id', () => {
  it('allows the product owner to delete their product', async () => {
    const user = await createUser('i')
    const room = await createRoom(user.accessToken)
    const productRes = await addProduct(user.accessToken, room._id)
    const productId = productRes.body.product._id

    const res = await request(app)
      .delete(`/api/v1/rooms/${room._id}/products/${productId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)

    expect(res.status).toBe(200)
  })

  it('allows the room owner to delete any product', async () => {
    const roomOwner = await createUser('j')
    const member = await createUser('k')
    const room = await createRoom(roomOwner.accessToken)

    await request(app)
      .post(`/api/v1/rooms/join/${room.inviteCode}`)
      .set('Authorization', `Bearer ${member.accessToken}`)

    const productRes = await addProduct(member.accessToken, room._id)
    const productId = productRes.body.product._id

    const res = await request(app)
      .delete(`/api/v1/rooms/${room._id}/products/${productId}`)
      .set('Authorization', `Bearer ${roomOwner.accessToken}`)

    expect(res.status).toBe(200)
  })

  it('prevents a member from deleting another member\'s product', async () => {
    const owner = await createUser('l')
    const member1 = await createUser('m')
    const member2 = await createUser('n')
    const room = await createRoom(owner.accessToken)

    await request(app).post(`/api/v1/rooms/join/${room.inviteCode}`).set('Authorization', `Bearer ${member1.accessToken}`)
    await request(app).post(`/api/v1/rooms/join/${room.inviteCode}`).set('Authorization', `Bearer ${member2.accessToken}`)

    const productRes = await addProduct(member1.accessToken, room._id)
    const productId = productRes.body.product._id

    const res = await request(app)
      .delete(`/api/v1/rooms/${room._id}/products/${productId}`)
      .set('Authorization', `Bearer ${member2.accessToken}`)

    expect(res.status).toBe(403)
  })
})

// ─── STATUS UPDATE ────────────────────────────────────────────────────────────

describe('PUT /api/v1/rooms/:roomId/products/:id/status', () => {
  it('allows room owner to mark a product as bought', async () => {
    const user = await createUser('o')
    const room = await createRoom(user.accessToken)
    const productRes = await addProduct(user.accessToken, room._id)
    const productId = productRes.body.product._id

    const res = await request(app)
      .put(`/api/v1/rooms/${room._id}/products/${productId}/status`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ status: 'bought' })

    expect(res.status).toBe(200)
    expect(res.body.product.status).toBe('bought')
  })

  it('prevents a non-owner member from changing product status', async () => {
    const owner = await createUser('p')
    const member = await createUser('q')
    const room = await createRoom(owner.accessToken)

    await request(app).post(`/api/v1/rooms/join/${room.inviteCode}`).set('Authorization', `Bearer ${member.accessToken}`)

    const productRes = await addProduct(owner.accessToken, room._id)
    const productId = productRes.body.product._id

    const res = await request(app)
      .put(`/api/v1/rooms/${room._id}/products/${productId}/status`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ status: 'bought' })

    expect(res.status).toBe(403)
  })
})

// ─── ORPHAN CASCADE FIX ───────────────────────────────────────────────────────

describe('DELETE /rooms/:roomId/products/:id — cascade cleanup', () => {
  it('deletes votes, comments and reactions when a product is deleted', async () => {
    const { accessToken } = await createUser('casc')

    const roomRes = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Cascade Room' })
    const roomId = roomRes.body.room._id

    const productRes = await request(app)
      .post(`/api/v1/rooms/${roomId}/products`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Product to delete', platform: 'other' })
    const productId = productRes.body.product._id

    // Add a vote
    await request(app)
      .post(`/api/v1/products/${productId}/vote`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 1 })

    // Add a comment
    await request(app)
      .post(`/api/v1/products/${productId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Nice product' })

    // Add a reaction
    await request(app)
      .post(`/api/v1/products/${productId}/reactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ emoji: '👍' })

    // Delete the product
    await request(app)
      .delete(`/api/v1/rooms/${roomId}/products/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    // Verify nothing is orphaned
    const Vote = require('../src/models/Vote')
    const Comment = require('../src/models/Comment')
    const Reaction = require('../src/models/Reaction')

    const votes = await Vote.find({ productId })
    const comments = await Comment.find({ productId })
    const reactions = await Reaction.find({ productId })

    expect(votes).toHaveLength(0)
    expect(comments).toHaveLength(0)
    expect(reactions).toHaveLength(0)
  })
})

// ─── IDOR FIX ─────────────────────────────────────────────────────────────────

describe('Security: updateStatus IDOR protection', () => {
  it('cannot update status of a product belonging to a different room', async () => {
    const owner = await createUser('idor1')
    const other = await createUser('idor2')

    // Owner creates room A with a product
    const roomA = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Room A' })
    const roomAId = roomA.body.room._id

    const productRes = await request(app)
      .post(`/api/v1/rooms/${roomAId}/products`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ title: 'Product in A', platform: 'other' })
    const productId = productRes.body.product._id

    // Other user creates room B
    const roomB = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${other.accessToken}`)
      .send({ name: 'Room B' })
    const roomBId = roomB.body.room._id

    // Other tries to update product from room A via room B's URL
    const res = await request(app)
      .put(`/api/v1/rooms/${roomBId}/products/${productId}/status`)
      .set('Authorization', `Bearer ${other.accessToken}`)
      .send({ status: 'bought' })

    // Should be 403 (not a member of room B's context for this product)
    // or 404 (product not found in room B) — either is correct
    expect([403, 404]).toContain(res.status)

    // Verify status was NOT changed
    const Product = require('../src/models/Product')
    const product = await Product.findById(productId)
    expect(product.status).toBe('active')
  })
})
