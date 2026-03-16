const Comment = require('../models/Comment')
const Product = require('../models/Product')
const Room    = require('../models/Room')
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
      text:   req.body.text,
    })

    await comment.populate('userId', 'name username')

    getIO().to(`room:${product.roomId.toString()}`).emit('comment:added', comment)

    res.status(201).json({ success: true, comment })
  } catch (err) {
    next(err)
  }
}

// --- GET COMMENTS (paginated) ---
exports.getComments = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) throw new ApiError(404, 'Product not found')

    await assertRoomMember(product.roomId, req.user.id)

    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const page  = Math.max(parseInt(req.query.page)  || 1,  1)
    const skip  = (page - 1) * limit

    const [comments, total] = await Promise.all([
      Comment.find({ productId: req.params.id })
        .populate('userId', 'name username')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ productId: req.params.id }),
    ])

    res.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    })
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

    const isCommentOwner = comment.userId.toString() === req.user.id
    const isRoomOwner    = room?.createdBy.toString() === req.user.id

    if (!isCommentOwner && !isRoomOwner) {
      throw new ApiError(403, 'Not authorized to delete this comment')
    }

    const roomId    = comment.roomId.toString()
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

    comment.text   = req.body.text
    comment.edited = true
    await comment.save()
    await comment.populate('userId', 'name username')

    // Emit so other members see the edit in real-time
    getIO()
      .to(`room:${comment.roomId.toString()}`)
      .emit('comment:edited', {
        commentId:  comment._id.toString(),
        productId:  comment.productId.toString(),
        text:       comment.text,
        edited:     true,
      })

    res.json({ success: true, comment })
  } catch (err) {
    next(err)
  }
}