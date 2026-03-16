/**
 * rooms.test.js — Room system tests
 * Covers: create, join by invite code, non-member 403, owner delete, member can't delete
 */
const request = require('supertest')
const app = require('../src/app')

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function createUser(suffix = '') {
  const res = await request(app).post('/api/v1/auth/signup').send({
    name: `User ${suffix}`,
    username: `user${suffix}${Date.now()}`,
    email: `user${suffix}${Date.now()}@example.com`,
    password: 'Password1!',
  })
  return res.body // { accessToken, refreshToken, user }
}

async function createRoom(token, overrides = {}) {
  const res = await request(app)
    .post('/api/v1/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Room', ...overrides })
  return res
}

// ─── CREATE ROOM ──────────────────────────────────────────────────────────────

describe('POST /api/v1/rooms', () => {
  it('creates a room and adds creator as member + owner', async () => {
    const { accessToken, user } = await createUser('a')

    const res = await createRoom(accessToken, { name: 'My Shopping Room' })

    expect(res.status).toBe(201)
    expect(res.body.room.name).toBe('My Shopping Room')
    expect(res.body.room.createdBy).toBe(user.id)
    expect(res.body.room.inviteCode).toBeDefined()
    expect(res.body.room.members).toContain(user.id)
  })

  it('rejects creation without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/rooms')
      .send({ name: 'Unauthenticated Room' })

    expect(res.status).toBe(401)
  })

  it('rejects room name longer than 60 chars', async () => {
    const { accessToken } = await createUser('b')
    const res = await createRoom(accessToken, { name: 'A'.repeat(61) })
    expect(res.status).toBe(400)
  })
})

// ─── JOIN BY CODE ─────────────────────────────────────────────────────────────

describe('POST /api/v1/rooms/join/:code', () => {
  it('allows a second user to join with a valid invite code', async () => {
    const owner = await createUser('c')
    const joiner = await createUser('d')

    const roomRes = await createRoom(owner.accessToken)
    const { inviteCode, _id: roomId } = roomRes.body.room

    const joinRes = await request(app)
      .post(`/api/v1/rooms/join/${inviteCode}`)
      .set('Authorization', `Bearer ${joiner.accessToken}`)

    expect(joinRes.status).toBe(200)
    expect(joinRes.body.room._id).toBe(roomId)
  })

  it('rejects an invalid invite code', async () => {
    const { accessToken } = await createUser('e')

    const res = await request(app)
      .post('/api/v1/rooms/join/INVALID9')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(404)
  })

  it('does not double-add a member who rejoins', async () => {
    const owner = await createUser('f')
    const joiner = await createUser('g')

    const roomRes = await createRoom(owner.accessToken)
    const { inviteCode } = roomRes.body.room

    await request(app)
      .post(`/api/v1/rooms/join/${inviteCode}`)
      .set('Authorization', `Bearer ${joiner.accessToken}`)

    const joinAgain = await request(app)
      .post(`/api/v1/rooms/join/${inviteCode}`)
      .set('Authorization', `Bearer ${joiner.accessToken}`)

    // Should still succeed (idempotent)
    expect(joinAgain.status).toBe(200)

    // Members list should not contain duplicate
    const members = joinAgain.body.room.members
    const joinerOccurrences = members.filter((id) => id === joiner.user.id).length
    expect(joinerOccurrences).toBe(1)
  })
})

// ─── MEMBERSHIP GUARD ─────────────────────────────────────────────────────────

describe('GET /api/v1/rooms/:roomId (membership guard)', () => {
  it('returns room data for a member', async () => {
    const { accessToken } = await createUser('h')
    const roomRes = await createRoom(accessToken)
    const roomId = roomRes.body.room._id

    const res = await request(app)
      .get(`/api/v1/rooms/${roomId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.room._id).toBe(roomId)
  })

  it('returns 403 for a non-member', async () => {
    const owner = await createUser('i')
    const outsider = await createUser('j')

    const roomRes = await createRoom(owner.accessToken)
    const roomId = roomRes.body.room._id

    const res = await request(app)
      .get(`/api/v1/rooms/${roomId}`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)

    expect(res.status).toBe(403)
  })
})

// ─── DELETE ROOM ──────────────────────────────────────────────────────────────

describe('DELETE /api/v1/rooms/:roomId', () => {
  it('allows owner to delete their room', async () => {
    const { accessToken } = await createUser('k')
    const roomRes = await createRoom(accessToken)
    const roomId = roomRes.body.room._id

    const res = await request(app)
      .delete(`/api/v1/rooms/${roomId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('prevents a member (non-owner) from deleting the room', async () => {
    const owner = await createUser('l')
    const member = await createUser('m')

    const roomRes = await createRoom(owner.accessToken)
    const { inviteCode, _id: roomId } = roomRes.body.room

    // Member joins the room
    await request(app)
      .post(`/api/v1/rooms/join/${inviteCode}`)
      .set('Authorization', `Bearer ${member.accessToken}`)

    const res = await request(app)
      .delete(`/api/v1/rooms/${roomId}`)
      .set('Authorization', `Bearer ${member.accessToken}`)

    expect(res.status).toBe(403)
  })
})
