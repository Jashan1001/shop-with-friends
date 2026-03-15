const Room = require('../models/Room')
const User = require('../models/User')
const ApiError = require('../utils/apiError')
const generateInviteCode = require('../utils/generateInviteCode')

// --- CREATE ROOM ---
exports.createRoom = async (req, res, next) => {
  try {
    const { name, description, emoji } = req.body

    const room = await Room.create({
      name,
      description,
      emoji,
      createdBy: req.user.id,
      members: [req.user.id], // creator is automatically a member
      inviteCode: generateInviteCode(),
    })

    // Add room to user's rooms array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { rooms: room._id },
    })

    res.status(201).json({ success: true, room })
  } catch (err) {
    next(err)
  }
}

// --- GET ALL ROOMS FOR CURRENT USER ---
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ members: req.user.id })
      .populate('members', 'name username avatar')
      .populate('createdBy', 'name username')
      .sort({ updatedAt: -1 })

    res.json({ success: true, rooms })
  } catch (err) {
    next(err)
  }
}

// --- GET SINGLE ROOM ---
exports.getRoom = async (req, res, next) => {
  try {
    // req.room already attached by isMember middleware
    const room = await Room.findById(req.params.roomId)
      .populate('members', 'name username avatar')
      .populate('createdBy', 'name username')

    res.json({ success: true, room })
  } catch (err) {
    next(err)
  }
}

// --- UPDATE ROOM ---
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { ...req.body },
      { new: true } // return updated document
    )

    res.json({ success: true, room })
  } catch (err) {
    next(err)
  }
}

// --- DELETE ROOM ---
exports.deleteRoom = async (req, res, next) => {
  try {
    await Room.findByIdAndDelete(req.params.roomId)

    // Remove room from all members' rooms arrays
    await User.updateMany(
      { rooms: req.params.roomId },
      { $pull: { rooms: req.params.roomId } }
    )

    res.json({ success: true, message: 'Room deleted' })
  } catch (err) {
    next(err)
  }
}

// --- JOIN ROOM BY INVITE CODE ---
exports.joinRoom = async (req, res, next) => {
  try {
    const { code } = req.params

    const room = await Room.findOne({ inviteCode: code.toUpperCase() })

    if (!room) {
      throw new ApiError(404, 'Invalid invite code')
    }

    // Check if already a member
    const alreadyMember = room.members.some(
      (id) => id.toString() === req.user.id
    )

    if (alreadyMember) {
      return res.json({ success: true, room, message: 'Already a member' })
    }

    // Check max members
    if (room.members.length >= room.maxMembers) {
      throw new ApiError(400, 'Room is full')
    }

    // Add user to room members
    room.members.push(req.user.id)
    await room.save()

    // Add room to user's rooms array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { rooms: room._id },
    })

    res.json({ success: true, room })
  } catch (err) {
    next(err)
  }
}

// --- LEAVE ROOM ---
exports.leaveRoom = async (req, res, next) => {
  try {
    const room = req.room

    if (room.createdBy.toString() === req.user.id) {
      throw new ApiError(400, 'Owner cannot leave — delete the room instead')
    }

    room.members = room.members.filter(
      (id) => id.toString() !== req.user.id
    )
    await room.save()

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { rooms: room._id },
    })

    res.json({ success: true, message: 'Left room' })
  } catch (err) {
    next(err)
  }
}

// --- REGENERATE INVITE CODE ---
exports.regenerateInvite = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { inviteCode: generateInviteCode() },
      { new: true }
    )

    res.json({ success: true, inviteCode: room.inviteCode })
  } catch (err) {
    next(err)
  }
}

// --- REMOVE MEMBER ---
exports.removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params
    const room = req.room

    if (userId === room.createdBy.toString()) {
      throw new ApiError(400, 'Cannot remove the room owner')
    }

    room.members = room.members.filter(
      (id) => id.toString() !== userId
    )
    await room.save()

    await User.findByIdAndUpdate(userId, {
      $pull: { rooms: room._id },
    })

    res.json({ success: true, message: 'Member removed' })
  } catch (err) {
    next(err)
  }
}