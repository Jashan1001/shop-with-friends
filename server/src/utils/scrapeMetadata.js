const axios = require('axios')
const cheerio = require('cheerio')

/**
 * Scrape Open Graph + meta tags from a product URL.
 * Returns { title, image, price, description, platform }
 * Gracefully returns partial data if scraping is blocked.
 */
async function scrapeMetadata(url) {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 8000,
      headers: {
        // Mimic a real browser enough to get OG tags from most sites
        'User-Agent': 'Mozilla/5.0 (compatible; CartCrew/1.0; +https://cartcrew.app)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
    })

    const $ = cheerio.load(html)

    const og = (prop) =>
      $(`meta[property="og:${prop}"]`).attr('content') ||
      $(`meta[name="og:${prop}"]`).attr('content') ||
      ''

    const meta = (name) =>
      $(`meta[name="${name}"]`).attr('content') || ''

    const title =
      og('title') ||
      $('title').text().trim().split('|')[0].trim() ||
      $('h1').first().text().trim() ||
      ''

    const image = og('image') || ''
    const description = og('description') || meta('description') || ''

    // Price — look for common patterns in OG or JSON-LD
    let price = ''
    const priceMeta = $('meta[property="product:price:amount"]').attr('content') ||
                      $('meta[name="twitter:data1"]').attr('content') || ''
    if (priceMeta && !isNaN(parseFloat(priceMeta))) {
      price = priceMeta
    }

    // Detect platform from URL
    const platform = detectPlatform(url)

    return {
      title: title.slice(0, 200),
      image,
      description: description.slice(0, 500),
      price: price ? parseFloat(price) : undefined,
      platform,
    }
  } catch (err) {
    // Scraping blocked or network error — return minimal data
    // The client will fall back to manual entry
    return {
      title: '',
      image: '',
      description: '',
      price: undefined,
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
