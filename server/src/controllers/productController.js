const Product = require('../models/Product')
const Vote = require('../models/Vote')
const ApiError = require('../utils/apiError')
const scrapeMetadata = require('../utils/scrapeMetadata')
const { getIO } = require('../socket/socketHandlers')

// --- ADD PRODUCT ---
exports.addProduct = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const product = await Product.create({
      ...req.body,
      roomId,
      addedBy: req.user.id,
    })

    await product.populate('addedBy', 'name username')

    // Emit to everyone in the room
    getIO().to(`room:${roomId}`).emit('product:added', product)

    res.status(201).json({ success: true, product })
  } catch (err) {
    next(err)
  }
}

// --- GET PRODUCTS ---
exports.getProducts = async (req, res, next) => {
  try {
    const { roomId } = req.params

    const products = await Product.find({ roomId })
      .populate('addedBy', 'name username')
      .sort({ createdAt: -1 })

    const productIds = products.map((p) => p._id)

    // One query for all votes in this room feed.
    const allVotes = await Vote.find({ productId: { $in: productIds } })

    const productsWithVotes = products.map((product) => {
      const votes = allVotes.filter(
        (v) => v.productId.toString() === product._id.toString()
      )
      const upvotes = votes.filter((v) => v.value === 1).length
      const downvotes = votes.filter((v) => v.value === -1).length
      const userVote = votes.find((v) => v.userId.toString() === req.user.id)

      return {
        ...product.toObject(),
        upvotes,
        downvotes,
        userVote: userVote?.value || 0,
      }
    })

    res.json({ success: true, products: productsWithVotes })
  } catch (err) {
    next(err)
  }
}

// --- UPDATE PRODUCT ---
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) throw new ApiError(404, 'Product not found')

    if (product.addedBy.toString() !== req.user.id) {
      throw new ApiError(403, 'You can only edit your own products')
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('addedBy', 'name username')

    res.json({ success: true, product: updated })
  } catch (err) {
    next(err)
  }
}

// --- DELETE PRODUCT ---
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) throw new ApiError(404, 'Product not found')

    const room = req.room
    const isProductOwner = product.addedBy.toString() === req.user.id
    const isRoomOwner = room.createdBy.toString() === req.user.id

    if (!isProductOwner && !isRoomOwner) {
      throw new ApiError(403, 'Not authorized to delete this product')
    }

    const roomId = product.roomId.toString()
    await Product.findByIdAndDelete(req.params.id)
    await Vote.deleteMany({ productId: req.params.id })

    getIO().to(`room:${roomId}`).emit('product:deleted', { productId: req.params.id })

    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    next(err)
  }
}

// --- UPDATE STATUS (bought/skipped/active) ---
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('addedBy', 'name username')

    getIO().to(`room:${product.roomId.toString()}`).emit('product:updated', product)

    res.json({ success: true, product })
  } catch (err) {
    next(err)
  }
}

// --- SCRAPE PRODUCT URL ---
exports.scrapeProduct = async (req, res, next) => {
  try {
    const { url } = req.body
    if (!url) throw new ApiError(400, 'URL is required')

    const data = await scrapeMetadata(url)
    res.json({ success: true, ...data })
  } catch (err) {
    next(err)
  }
}