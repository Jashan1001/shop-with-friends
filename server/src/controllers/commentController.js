const Comment = require('../models/Comment')
const Product = require('../models/Product')
const ApiError = require('../utils/apiError')
const { getIO } = require('../socket/socketHandlers')
// --- ADD COMMENT ---
exports.addComment = async (req, res, next) => {
  try {
    const { id: productId } = req.params
    const product = await Product.findById(productId)
    if (!product) throw new ApiError(404, 'Product not found')

    const comment = await Comment.create({
      productId,
      roomId: product.roomId,
      userId: req.user.id,
      text: req.body.text,
    })

    await comment.populate('userId', 'name username')

    getIO().to(`room:${product.roomId.toString()}`).emit('comment:added', comment)

    res.status(201).json({ success: true, comment })
  } catch (err) {
    next(err)
  }
}

// --- GET COMMENTS ---
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ productId: req.params.id })
      .populate('userId', 'name username')
      .sort({ createdAt: 1 })

    res.json({ success: true, comments })
  } catch (err) {
    next(err)
  }
}

// --- DELETE COMMENT ---
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) throw new ApiError(404, 'Comment not found')

    if (comment.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You can only delete your own comments')
    }

    const roomId = comment.roomId.toString()
    const productId = comment.productId.toString()

    await Comment.findByIdAndDelete(req.params.commentId)

    getIO().to(`room:${roomId}`).emit('comment:deleted', {
      commentId: req.params.commentId,
      productId,
    })

    res.json({ success: true, message: 'Comment deleted' })
  } catch (err) {
    next(err)
  }
}