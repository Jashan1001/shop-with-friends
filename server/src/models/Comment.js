const mongoose = require('mongoose')
const { Schema } = mongoose

const commentSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
)

commentSchema.index({ productId: 1, createdAt: 1 })

module.exports = mongoose.model('Comment', commentSchema)