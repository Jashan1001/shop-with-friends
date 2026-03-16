const User = require('../models/User')
const ApiError = require('../utils/apiError')
const Room     = require('../models/Room')
const Product  = require('../models/Product')
const Vote     = require('../models/Vote')
const Comment  = require('../models/Comment')
const Reaction = require('../models/Reaction')
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
// DELETE /users/me — cascade-delete the user and all their owned data
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id

    // 1. Find all rooms this user owns
    const ownedRooms = await Room.find({ createdBy: userId })
    const ownedRoomIds = ownedRooms.map((r) => r._id)

    if (ownedRoomIds.length > 0) {
      // 2. Cascade delete everything inside owned rooms
      const productIds = await Product.find({
        roomId: { $in: ownedRoomIds },
      }).distinct('_id')

      await Vote.deleteMany({ productId: { $in: productIds } })
      await Comment.deleteMany({ roomId: { $in: ownedRoomIds } })
      await Reaction.deleteMany({ roomId: { $in: ownedRoomIds } })
      await Product.deleteMany({ roomId: { $in: ownedRoomIds } })
      await Room.deleteMany({ _id: { $in: ownedRoomIds } })

      // 3. Remove these rooms from all other members
      await User.updateMany(
        { rooms: { $in: ownedRoomIds } },
        { $pull: { rooms: { $in: ownedRoomIds } } }
      )
    }

    // 4. Remove user from rooms they were a member of (but didn't own)
    await Room.updateMany(
      { members: userId },
      { $pull: { members: userId, rooms: userId } }
    )
    await User.updateMany(
      { rooms: { $in: [] } },
      { $pull: { rooms: userId } }
    )

    // 5. Delete the user's own content in other rooms
    await Comment.deleteMany({ userId })
    await Reaction.deleteMany({ userId })
    await Vote.deleteMany({ userId })

    // 6. Finally delete the user document
    await User.findByIdAndDelete(userId)

    res.json({ success: true, message: 'Account deleted' })
  } catch (err) {
    next(err)
  }
}