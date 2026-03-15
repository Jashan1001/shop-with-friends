const express = require('express')
const router = express.Router()

const {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  regenerateInvite, removeMember,
} = require('../controllers/roomController')

const { protect } = require('../middleware/authMiddleware')
const { isMember, isOwner } = require('../middleware/roomMiddleware')
const validate = require('../middleware/validate')
const { createRoomSchema, updateRoomSchema } = require('../schemas/roomSchemas')

// All room routes require authentication
router.use(protect)

router.post('/', validate(createRoomSchema), createRoom)
router.get('/', getRooms)
router.get('/:roomId', isMember, getRoom)
router.put('/:roomId', isOwner, validate(updateRoomSchema), updateRoom)
router.delete('/:roomId', isOwner, deleteRoom)
router.post('/join/:code', joinRoom)
router.delete('/:roomId/leave', isMember, leaveRoom)
router.post('/:roomId/invite', isOwner, regenerateInvite)
router.delete('/:roomId/members/:userId', isOwner, removeMember)

module.exports = router