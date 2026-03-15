const Room = require('../models/Room')
const ApiError = require('../utils/apiError')

// Verify user is a member of the room
const isMember = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.roomId)

    if (!room) {
      throw new ApiError(404, 'Room not found')
    }

    const member = room.members.some(
      (id) => id.toString() === req.user.id
    )

    if (!member) {
      throw new ApiError(403, 'You are not a member of this room')
    }

    // Attach room to request so controllers don't fetch it again
    req.room = room
    next()
  } catch (err) {
    next(err)
  }
}

// Verify user is the owner of the room
const isOwner = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.roomId)

    if (!room) {
      throw new ApiError(404, 'Room not found')
    }

    if (room.createdBy.toString() !== req.user.id) {
      throw new ApiError(403, 'Only the room owner can do this')
    }

    req.room = room
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { isMember, isOwner }