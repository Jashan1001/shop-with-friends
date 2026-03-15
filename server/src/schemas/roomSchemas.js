const { z } = require('zod')

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(60),
  description: z.string().max(200).optional().default(''),
  emoji: z.string().optional().default('🛒'),
})

const updateRoomSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  description: z.string().max(200).optional(),
  emoji: z.string().optional(),
})

module.exports = { createRoomSchema, updateRoomSchema }