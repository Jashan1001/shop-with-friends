const Comment = require('../models/Comment')
const Product = require('../models/Product')
const Room = require('../models/Room')
const ApiError = require('../utils/apiError')
const { getIO } = require('../socket/socketHandlers')

const assertRoomMember = async (roomId, userId) => {
  const room = await Room.findById(roomId)
  if (!room) throw new ApiError(404, 'Room not found')

  const isMember = room.members.some((id) => id.toString() === userId)
  if (!isMember) throw new ApiError(403, 'You are not a member of this room')

  return room
}

// --- ADD COMMENT ---
exports.addComment = async (req, res, next) => {
  try {
    const { id: productId } = req.params
    const product = await Product.findById(productId)
    if (!product) throw new ApiError(404, 'Product not found')

    await assertRoomMember(product.roomId, req.user.id)

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
    const product = await Product.findById(req.params.id)
    if (!product) throw new ApiError(404, 'Product not found')

    await assertRoomMember(product.roomId, req.user.id)

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

    const room = await assertRoomMember(comment.roomId, req.user.id)

    // Both the comment author AND the room owner can delete comments
    const isCommentOwner = comment.userId.toString() === req.user.id
    const isRoomOwner = room?.createdBy.toString() === req.user.id

    if (!isCommentOwner && !isRoomOwner) {
      throw new ApiError(403, 'Not authorized to delete this comment')
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

// --- EDIT COMMENT ---
exports.editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) throw new ApiError(404, 'Comment not found')

    await assertRoomMember(comment.roomId, req.user.id)

    if (comment.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You can only edit your own comments')
    }

    comment.text = req.body.text
    comment.edited = true
    await comment.save()

    res.json({ success: true, comment })
  } catch (err) {
    next(err)
  }
}