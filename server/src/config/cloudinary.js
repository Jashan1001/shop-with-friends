const cloudinary = require('cloudinary').v2

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim().toLowerCase()
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim()
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim()

// In test environments, skip validation — Cloudinary is not used during tests
const isTest = process.env.NODE_ENV === 'test'

if (!isTest) {
  if (!cloudName || cloudName === 'your_cloud_name') {
    throw new Error('Cloudinary config error: set a valid CLOUDINARY_CLOUD_NAME in server/.env')
  }
  if (!apiKey || apiKey === 'your_api_key') {
    throw new Error('Cloudinary config error: set a valid CLOUDINARY_API_KEY in server/.env')
  }
  if (!apiSecret || apiSecret === 'your_api_secret') {
    throw new Error('Cloudinary config error: set a valid CLOUDINARY_API_SECRET in server/.env')
  }
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

module.exports = cloudinary
