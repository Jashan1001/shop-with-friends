const Vote = require('../models/Vote')
const Product = require('../models/Product')
const ApiError = require('../utils/apiError')

// --- VOTE (upsert) ---
exports.vote = async (req, res, next) => {
  try {
    const { value } = req.body
    const { id: productId } = req.params

    const product = await Product.findById(productId)
    if (!product) throw new ApiError(404, 'Product not found')

    // Upsert — update if exists, create if not
    await Vote.findOneAndUpdate(
      { productId, userId: req.user.id },
      { value, roomId: product.roomId },
      { upsert: true, new: true }
    )

    // Get updated counts
    const votes = await Vote.find({ productId })
    const upvotes = votes.filter((v) => v.value === 1).length
    const downvotes = votes.filter((v) => v.value === -1).length

    res.json({ success: true, upvotes, downvotes, userVote: value })
  } catch (err) {
    next(err)
  }
}

// --- REMOVE VOTE ---
exports.removeVote = async (req, res, next) => {
  try {
    const { id: productId } = req.params

    await Vote.findOneAndDelete({ productId, userId: req.user.id })

    const votes = await Vote.find({ productId })
    const upvotes = votes.filter((v) => v.value === 1).length
    const downvotes = votes.filter((v) => v.value === -1).length

    res.json({ success: true, upvotes, downvotes, userVote: 0 })
  } catch (err) {
    next(err)
  }
}