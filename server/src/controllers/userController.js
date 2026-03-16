const User = require('../models/User')
const ApiError = require('../utils/apiError')

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio },
      { new: true }
    )

    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.id).select('+password')
    if (!user) throw new ApiError(404, 'User not found')

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) throw new ApiError(400, 'Current password is incorrect')

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password updated' })
  } catch (err) {
    next(err)
  }
}

// POST /users/avatar  (multipart/form-data, field name: "avatar")
// Multer + Cloudinary handle the upload — req.file.path = Cloudinary URL
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'No image file provided')

    const avatarUrl = req.file.path  // Cloudinary secure URL

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    )

    res.json({ success: true, user, avatarUrl })
  } catch (err) {
    next(err)
  }
}

// GET /users/check-username?username=xxx  — live availability check
exports.checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query
    if (!username) return res.json({ available: false })

    const existing = await User.findOne({ username: username.toLowerCase() })
    res.json({ available: !existing })
  } catch (err) {
    next(err)
  }
}

// GET /users/:username — public profile
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('name username bio avatar createdAt')
    if (!user) throw new ApiError(404, 'User not found')
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}
