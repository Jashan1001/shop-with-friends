/**
 * comments.test.js
 * Tests: add, non-member blocked, author delete, room owner delete, cannot delete others, edit
 */
const request = require('supertest')
const app = require('../src/app')

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function createUser(tag = '') {
  const uid = Date.now().toString(36)
  const res = await request(app).post('/api/v1/auth/signup').send({
    name: `Comment User ${tag}`,
    username: `cu${tag}${uid}`,
    email: `cmtuser${tag}${uid}@example.com`,
    password: 'Password1!',
  })
  return res.body
}

async function createRoom(token) {
  const res = await request(app)
    .post('/api/v1/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Comment Test Room' })
  return res.body.room
}

async function addProduct(token, roomId) {
  const res = await request(app)
    .post(`/api/v1/rooms/${roomId}/products`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Product', platform: 'other' })
  return res.body.product
}

async function postComment(token, productId, text = 'Test comment') {
  const res = await request(app)
    .post(`/api/v1/products/${productId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ text })
  return res
}

// ─── ADD COMMENT ─────────────────────────────────────────────────────────────
describe('POST /api/v1/products/:id/comments', () => {
  it('allows a room member to add a comment', async () => {
    const user = await createUser('a')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    const res = await postComment(user.accessToken, product._id, 'Great product!')
    expect(res.status).toBe(201)
    expect(res.body.comment.text).toBe('Great product!')
    expect(res.body.comment.userId).toBeDefined()
  })

  it('rejects a comment from a non-member', async () => {
    const owner = await createUser('b')
    const outsider = await createUser('c')
    const room = await createRoom(owner.accessToken)
    const product = await addProduct(owner.accessToken, room._id)

    const res = await postComment(outsider.accessToken, product._id)
    expect(res.status).toBe(403)
  })

  it('rejects an empty comment', async () => {
    const user = await createUser('d')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    const res = await postComment(user.accessToken, product._id, '')
    expect(res.status).toBe(400)
  })

  it('rejects comment longer than 500 characters', async () => {
    const user = await createUser('e')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)

    const res = await postComment(user.accessToken, product._id, 'A'.repeat(501))
    expect(res.status).toBe(400)
  })
})

// ─── DELETE COMMENT ───────────────────────────────────────────────────────────
describe('DELETE /api/v1/products/:id/comments/:commentId', () => {
  it('allows the comment author to delete their own comment', async () => {
    const user = await createUser('f')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)
    const commentRes = await postComment(user.accessToken, product._id)
    const commentId = commentRes.body.comment._id

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}/comments/${commentId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
    expect(res.status).toBe(200)
  })

  it('allows the room owner to delete any comment (moderation)', async () => {
    const owner = await createUser('g')
    const member = await createUser('h')
    const room = await createRoom(owner.accessToken)

    // Member joins
    await request(app)
      .post(`/api/v1/rooms/join/${room.inviteCode}`)
      .set('Authorization', `Bearer ${member.accessToken}`)

    const product = await addProduct(owner.accessToken, room._id)
    const commentRes = await postComment(member.accessToken, product._id, 'Member comment')
    const commentId = commentRes.body.comment._id

    // Room owner deletes member's comment
    const res = await request(app)
      .delete(`/api/v1/products/${product._id}/comments/${commentId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
    expect(res.status).toBe(200)
  })

  it('prevents a member from deleting another member\'s comment', async () => {
    const owner = await createUser('i')
    const member1 = await createUser('j')
    const member2 = await createUser('k')
    const room = await createRoom(owner.accessToken)

    await request(app).post(`/api/v1/rooms/join/${room.inviteCode}`).set('Authorization', `Bearer ${member1.accessToken}`)
    await request(app).post(`/api/v1/rooms/join/${room.inviteCode}`).set('Authorization', `Bearer ${member2.accessToken}`)

    const product = await addProduct(owner.accessToken, room._id)
    const commentRes = await postComment(member1.accessToken, product._id, 'Member 1 comment')
    const commentId = commentRes.body.comment._id

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}/comments/${commentId}`)
      .set('Authorization', `Bearer ${member2.accessToken}`)
    expect(res.status).toBe(403)
  })

  it('returns 401 for unauthenticated delete', async () => {
    const user = await createUser('l')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)
    const commentRes = await postComment(user.accessToken, product._id)
    const commentId = commentRes.body.comment._id

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}/comments/${commentId}`)
    expect(res.status).toBe(401)
  })
})

// ─── EDIT COMMENT ─────────────────────────────────────────────────────────────
describe('PUT /api/v1/products/:id/comments/:commentId', () => {
  it('allows author to edit their comment and marks it as edited', async () => {
    const user = await createUser('m')
    const room = await createRoom(user.accessToken)
    const product = await addProduct(user.accessToken, room._id)
    const commentRes = await postComment(user.accessToken, product._id, 'Original text')
    const commentId = commentRes.body.comment._id

    const res = await request(app)
      .put(`/api/v1/products/${product._id}/comments/${commentId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ text: 'Edited text' })

    expect(res.status).toBe(200)
    expect(res.body.comment.text).toBe('Edited text')
    expect(res.body.comment.edited).toBe(true)
  })

  it('prevents another member from editing someone else\'s comment', async () => {
    const owner = await createUser('n')
    const member = await createUser('o')
    const room = await createRoom(owner.accessToken)
    await request(app).post(`/api/v1/rooms/join/${room.inviteCode}`).set('Authorization', `Bearer ${member.accessToken}`)

    const product = await addProduct(owner.accessToken, room._id)
    const commentRes = await postComment(owner.accessToken, product._id, 'Owner comment')
    const commentId = commentRes.body.comment._id

    const res = await request(app)
      .put(`/api/v1/products/${product._id}/comments/${commentId}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ text: 'Hijacked' })
    expect(res.status).toBe(403)
  })
})
