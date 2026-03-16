const axios = require('axios')
const cheerio = require('cheerio')

const scrapeMetadata = async (url) => {
  try {
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    const $ = cheerio.load(data)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      ''

    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      ''

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    let price = null

    const ogPrice =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content')

    if (ogPrice) {
      price = parseFloat(ogPrice.replace(/[^0-9.]/g, ''))
    }

    let platform = 'other'
    if (url.includes('amazon')) platform = 'amazon'
    else if (url.includes('flipkart')) platform = 'flipkart'
    else if (url.includes('myntra')) platform = 'myntra'

    return {
      title: title.trim().slice(0, 200),
      image: image.trim(),
      description: description.trim().slice(0, 500),
      price,
      platform,
    }
  } catch (err) {
    throw new Error(`Could not fetch product data: ${err.message}`)
  }
}

module.exports = scrapeMetadata