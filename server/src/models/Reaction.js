const { Schema, model, Types } = require('mongoose')

const reactionSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: 'Product', required: true },
    userId:    { type: Types.ObjectId, ref: 'User',    required: true },
    roomId:    { type: Types.ObjectId, ref: 'Room',    required: true },
    emoji:     { type: String, required: true, maxlength: 8 },
  },
  { timestamps: true }
)

// One reaction per user per emoji per product
reactionSchema.index({ productId: 1, userId: 1, emoji: 1 }, { unique: true })

module.exports = model('Reaction', reactionSchema)
