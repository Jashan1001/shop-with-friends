const mongoose = require('mongoose')
const { Schema } = mongoose

const voteSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
)

// This is what prevents double voting at the database level
voteSchema.index({ productId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Vote', voteSchema)