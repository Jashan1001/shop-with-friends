const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    price: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
    image: { type: String, default: '' },
    link: { type: String, default: '' },
    platform: {
      type: String,
      enum: ['amazon', 'flipkart', 'myntra', 'other'],
      default: 'other',
    },
    description: { type: String, default: '', maxlength: 500 },
    status: {
      type: String,
      enum: ['active', 'bought', 'skipped'],
      default: 'active',
    },
  },
  { timestamps: true }
)

productSchema.index({ roomId: 1, createdAt: -1 })
productSchema.index({ addedBy: 1 })

module.exports = mongoose.model('Product', productSchema)