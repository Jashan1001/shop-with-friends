const mongoose = require('mongoose')
const { Schema } = mongoose

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [60, 'Room name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    emoji: {
      type: String,
      default: '🛒',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    inviteCode: {
      type: String,
      unique: true,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    maxMembers: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
)

roomSchema.index({ inviteCode: 1 })
roomSchema.index({ createdBy: 1 })

module.exports = mongoose.model('Room', roomSchema)