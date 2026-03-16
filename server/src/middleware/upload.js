const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')

// Avatar storage — stored in cartcrew/avatars folder on Cloudinary
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cartcrew/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
})

// Product image storage
const productImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cartcrew/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 450, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
})

// File filter — images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const FIVE_MB = 5 * 1024 * 1024

exports.uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: FIVE_MB },
}).single('avatar')

exports.uploadProductImage = multer({
  storage: productImageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: FIVE_MB },
}).single('image')
