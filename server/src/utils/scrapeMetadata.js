const axios = require('axios')
const cheerio = require('cheerio')
const dns = require('dns').promises
const net = require('net')

/**
 * Returns true if the IP is a private/loopback/link-local address.
 * Blocks SSRF attacks targeting internal infrastructure.
 */
function isPrivateIP(ip) {
  // IPv4 private ranges + loopback + link-local
  const v4Private = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|169\.254\.)/
  // IPv6 loopback, link-local, unique local
  const v6Private = /^(::1$|fe80:|fc00:|fd[0-9a-f]{2}:)/i
  return v4Private.test(ip) || v6Private.test(ip)
}

/**
 * Validates a URL is safe to fetch:
 * - Must use https:// protocol only
 * - Hostname must resolve to a public IP (not private/loopback)
 */
async function validateURL(rawUrl) {
  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { ok: false, error: 'Invalid URL format.' }
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only HTTPS URLs are supported.' }
  }

  // Block direct IP addresses in the URL
  if (net.isIP(parsed.hostname)) {
    if (isPrivateIP(parsed.hostname)) {
      return { ok: false, error: 'URL points to a private network address.' }
    }
  }

  // Resolve hostname to IPs and check each one
  try {
    const addresses = await dns.lookup(parsed.hostname, { all: true })
    for (const { address } of addresses) {
      if (isPrivateIP(address)) {
        return { ok: false, error: 'URL resolves to a private network address.' }
      }
    }
  } catch {
    return { ok: false, error: 'Could not resolve hostname.' }
  }

  return { ok: true }
}

/**
 * Scrape Open Graph + meta tags from a product URL.
 * Returns { title, image, price, description, platform }
 * Gracefully returns partial data if scraping is blocked.
 */
async function scrapeMetadata(url) {
  // SSRF protection — validate before making any outbound request
  const validation = await validateURL(url)
  if (!validation.ok) {
    return {
      title: '', image: '', description: '', price: undefined,
      platform: detectPlatform(url),
      error: validation.error,
    }
  }

  try {
    const { data: html } = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CartCrew/1.0)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Prevent following redirects to private IPs (open redirect + SSRF)
      beforeRedirect: async (options, { headers }) => {
        if (headers.location) {
          const check = await validateURL(headers.location)
          if (!check.ok) throw new Error('Redirect to private address blocked')
        }
      },
    })

    const $ = cheerio.load(html)

    const og = (prop) =>
      $(`meta[property="og:${prop}"]`).attr('content') ||
      $(`meta[name="og:${prop}"]`).attr('content') ||
      ''
    const meta = (name) => $(`meta[name="${name}"]`).attr('content') || ''

    const title =
      og('title') ||
      $('title').text().trim().split('|')[0].trim() ||
      $('h1').first().text().trim() ||
      ''

    const image = og('image') || ''
    const description = og('description') || meta('description') || ''

    let price = ''
    const priceMeta =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[name="twitter:data1"]').attr('content') || ''
    if (priceMeta && !isNaN(parseFloat(priceMeta))) {
      price = priceMeta
    }

    return {
      title: title.slice(0, 200),
      image,
      description: description.slice(0, 500),
      price: price ? parseFloat(price) : undefined,
      platform: detectPlatform(url),
    }
  } catch (err) {
    return {
      title: '', image: '', description: '', price: undefined,
      platform: detectPlatform(url),
      error: 'Could not fetch page. Please fill in manually.',
    }
  }
}

function detectPlatform(url = '') {
  if (url.includes('amazon')) return 'amazon'
  if (url.includes('flipkart')) return 'flipkart'
  if (url.includes('myntra')) return 'myntra'
  return 'other'
}

module.exports = scrapeMetadata
