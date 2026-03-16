const Vote = require('../models/Vote')
const Product = require('../models/Product')
const ApiError = require('../utils/apiError')
const { getIO } = require('../socket/socketHandlers')
// --- VOTE (upsert) ---
exports.vote = async (req, res, next) => {
  try {
    const { value } = req.body
    const { id: productId } = req.params

    const product = await Product.findById(productId)
    if (!product) throw new ApiError(404, 'Product not found')

    await Vote.findOneAndUpdate(
      { productId, userId: req.user.id },
      { value, roomId: product.roomId },
      { upsert: true, new: true }
    )

    const votes = await Vote.find({ productId })
    const upvotes = votes.filter((v) => v.value === 1).length
    const downvotes = votes.filter((v) => v.value === -1).length

    const voteData = { productId, upvotes, downvotes, userVote: value }

    getIO().to(`room:${product.roomId.toString()}`).emit('vote:updated', voteData)

    res.json({ success: true, ...voteData })
  } catch (err) {
    next(err)
  }
}

// --- REMOVE VOTE ---
exports.removeVote = async (req, res, next) => {
  try {
    const { id: productId } = req.params

    const product = await Product.findById(productId)
    await Vote.findOneAndDelete({ productId, userId: req.user.id })

    const votes = await Vote.find({ productId })
    const upvotes = votes.filter((v) => v.value === 1).length
    const downvotes = votes.filter((v) => v.value === -1).length

    const voteData = { productId, upvotes, downvotes, userVote: 0 }

    if (product) {
      getIO().to(`room:${product.roomId.toString()}`).emit('vote:updated', voteData)
    }

    res.json({ success: true, ...voteData })
  } catch (err) {
    next(err)
  }
}