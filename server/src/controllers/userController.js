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