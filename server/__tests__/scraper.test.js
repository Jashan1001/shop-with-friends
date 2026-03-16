/**
 * scraper.test.js
 * Tests SSRF protection and URL validation. Uses mocked axios — no real network calls.
 */

// ─── Mock axios before requiring the module ───────────────────────────────────
jest.mock('axios')
const axios = require('axios')

// Mock dns.lookup to control what IPs hostnames resolve to
jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
}))
const dns = require('dns').promises

const scrapeMetadata = require('../src/utils/scrapeMetadata')

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── URL VALIDATION ───────────────────────────────────────────────────────────
describe('scrapeMetadata — URL validation (SSRF protection)', () => {
  it('rejects http:// URLs — only https allowed', async () => {
    const result = await scrapeMetadata('http://example.com/product')
    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/https/i)
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('rejects invalid URLs', async () => {
    const result = await scrapeMetadata('not-a-url')
    expect(result.error).toBeDefined()
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('rejects URLs that resolve to private IP (10.x.x.x)', async () => {
    dns.lookup.mockResolvedValue([{ address: '10.0.0.1', family: 4 }])
    const result = await scrapeMetadata('https://internal.example.com/product')
    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/private/i)
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('rejects URLs that resolve to loopback (127.0.0.1)', async () => {
    dns.lookup.mockResolvedValue([{ address: '127.0.0.1', family: 4 }])
    const result = await scrapeMetadata('https://localhost.example.com/product')
    expect(result.error).toBeDefined()
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('rejects URLs that resolve to link-local (169.254.x.x — AWS metadata)', async () => {
    dns.lookup.mockResolvedValue([{ address: '169.254.169.254', family: 4 }])
    const result = await scrapeMetadata('https://aws-meta.example.com/')
    expect(result.error).toBeDefined()
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('rejects direct private IP in URL', async () => {
    const result = await scrapeMetadata('https://192.168.1.1/admin')
    expect(result.error).toBeDefined()
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('allows public HTTPS URLs to proceed to fetch', async () => {
    dns.lookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }])
    axios.get.mockResolvedValue({
      data: '<html><head><title>Test Product | Shop</title></head><body><h1>Test</h1></body></html>',
    })

    const result = await scrapeMetadata('https://example.com/product')
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(result.title).toBeTruthy()
    expect(result.error).toBeUndefined()
  })
})

// ─── METADATA EXTRACTION ──────────────────────────────────────────────────────
describe('scrapeMetadata — OG tag extraction', () => {
  beforeEach(() => {
    // Default: public IP
    dns.lookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }])
  })

  it('extracts title from og:title meta tag', async () => {
    axios.get.mockResolvedValue({
      data: `<html><head>
        <meta property="og:title" content="Sony WH-1000XM5 Headphones" />
      </head><body></body></html>`,
    })

    const result = await scrapeMetadata('https://amazon.in/product/B09XS7JWHH')
    expect(result.title).toBe('Sony WH-1000XM5 Headphones')
    expect(result.platform).toBe('amazon')
  })

  it('falls back to <title> tag when og:title is absent', async () => {
    axios.get.mockResolvedValue({
      data: '<html><head><title>Great Product | MySite</title></head><body></body></html>',
    })

    const result = await scrapeMetadata('https://example.com/product')
    expect(result.title).toBe('Great Product')
  })

  it('extracts image from og:image', async () => {
    axios.get.mockResolvedValue({
      data: `<html><head>
        <meta property="og:image" content="https://cdn.example.com/image.jpg" />
      </head><body></body></html>`,
    })

    const result = await scrapeMetadata('https://example.com/product')
    expect(result.image).toBe('https://cdn.example.com/image.jpg')
  })

  it('returns graceful fallback on network error', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'))

    const result = await scrapeMetadata('https://blocked.example.com/product')
    expect(result.title).toBe('')
    expect(result.error).toBeDefined()
  })

  it('detects platform from URL', async () => {
    dns.lookup.mockResolvedValue([{ address: '1.2.3.4', family: 4 }])
    axios.get.mockResolvedValue({ data: '<html><head></head><body></body></html>' })

    const amazon = await scrapeMetadata('https://www.amazon.in/dp/B09XS7JWHH')
    expect(amazon.platform).toBe('amazon')

    const flipkart = await scrapeMetadata('https://www.flipkart.com/product/p/123')
    expect(flipkart.platform).toBe('flipkart')
  })
})
