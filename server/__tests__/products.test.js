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
