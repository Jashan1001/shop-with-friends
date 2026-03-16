/**
 * auth.test.js — Authentication route tests
 * Covers: signup, login, wrong password, refresh token, logout
 */
const request = require('supertest')
const app = require('../src/app')

const validUser = {
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password1!',
}

// Helper: signup and return tokens
async function signupAndLogin(overrides = {}) {
  const payload = { ...validUser, ...overrides }
  const res = await request(app).post('/api/v1/auth/signup').send(payload)
  return res.body
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/signup', () => {
  it('creates a user and returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send(validUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.refreshToken).toBeDefined()
    expect(res.body.user.email).toBe(validUser.email)
    expect(res.body.user.password).toBeUndefined() // never expose password
  })

  it('rejects duplicate email', async () => {
    await request(app).post('/api/v1/auth/signup').send(validUser)
    const res = await request(app).post('/api/v1/auth/signup').send(validUser)

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/email|username/i)
  })

  it('rejects duplicate username', async () => {
    await request(app).post('/api/v1/auth/signup').send(validUser)
    const res = await request(app).post('/api/v1/auth/signup').send({
      ...validUser,
      email: 'other@example.com', // different email, same username
    })

    expect(res.status).toBe(409)
  })

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'incomplete@example.com' })

    expect(res.status).toBe(400)
  })
})

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/signup').send(validUser)
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: validUser.email,
      password: validUser.password,
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.refreshToken).toBeDefined()
  })

  it('logs in with uppercase/whitespace email input', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: `  ${validUser.email.toUpperCase()}  `,
      password: validUser.password,
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('rejects wrong password with vague error (no user enumeration)', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: validUser.email,
      password: 'WrongPassword99!',
    })

    expect(res.status).toBe(401)
    // Must not say "password incorrect" — must say the same for wrong email too
    expect(res.body.message).toBe('Invalid email or password')
  })

  it('rejects non-existent email with same vague error', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'nobody@example.com',
      password: 'SomePass1!',
    })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid email or password')
  })
})

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  it('issues a new access token given a valid refresh token', async () => {
    const { refreshToken } = await signupAndLogin()

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.refreshToken).toBeDefined()
    // Refresh token should be rotated (different from the original)
    expect(res.body.refreshToken).not.toBe(refreshToken)
  })

  it('rejects an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'totally.invalid.token' })

    expect(res.status).toBe(401)
  })

  it('rejects a revoked refresh token (after logout)', async () => {
    const { accessToken, refreshToken } = await signupAndLogin()

    // Logout — this invalidates the refresh token in the DB
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)

    // Try to refresh with the now-revoked token
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })

    expect(res.status).toBe(401)
  })
})

// ─── GET ME ───────────────────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', () => {
  it('returns current user when authenticated', async () => {
    const { accessToken } = await signupAndLogin()

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(validUser.email)
    expect(res.body.user.password).toBeUndefined()
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me')
    expect(res.status).toBe(401)
  })
})

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('invalidates session successfully', async () => {
    const { accessToken } = await signupAndLogin()

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
