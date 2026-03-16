const Reaction = require('../models/Reaction')
const Product = require('../models/Product')
const ApiError = require('../utils/apiError')
const { getIO } = require('../socket/socketHandlers')

// GET /products/:id/reactions
exports.getReactions = async (req, res, next) => {
  try {
    const { id: productId } = req.params

    const reactions = await Reaction.find({ productId })

    // Group by emoji: { emoji -> { count, users: [], hasReacted } }
    const grouped = {}
    reactions.forEach((r) => {
      const e = r.emoji
      if (!grouped[e]) grouped[e] = { emoji: e, count: 0, users: [], hasReacted: false }
      grouped[e].count++
      grouped[e].users.push(r.userId.toString())
      if (r.userId.toString() === req.user.id) grouped[e].hasReacted = true
    })

    res.json({ success: true, reactions: Object.values(grouped) })
  } catch (err) {
    next(err)
  }
}

// POST /products/:id/reactions  { emoji }
exports.addReaction = async (req, res, next) => {
  try {
    const { id: productId } = req.params
    const { emoji } = req.body

    if (!emoji) throw new ApiError(400, 'Emoji is required')

    const product = await Product.findById(productId)
    if (!product) throw new ApiError(404, 'Product not found')

    // Upsert: if already exists, toggle it off (delete), otherwise create
    const existing = await Reaction.findOne({ productId, userId: req.user.id, emoji })

    if (existing) {
      await existing.deleteOne()
    } else {
      await Reaction.create({ productId, userId: req.user.id, roomId: product.roomId, emoji })
    }

    // Re-fetch all reactions for this product
    const allReactions = await Reaction.find({ productId })
    const grouped = {}
    allReactions.forEach((r) => {
      const e = r.emoji
      if (!grouped[e]) grouped[e] = { emoji: e, count: 0, hasReacted: false }
      grouped[e].count++
      if (r.userId.toString() === req.user.id) grouped[e].hasReacted = true
    })
    const reactionList = Object.values(grouped)

    // Emit to room
    getIO()
      .to(`room:${product.roomId.toString()}`)
      .emit('reaction:burst', {
        productId,
        emoji,
        userId: req.user.id,
        reactions: reactionList,
      })

    res.json({ success: true, reactions: reactionList })
  } catch (err) {
    next(err)
  }
}
