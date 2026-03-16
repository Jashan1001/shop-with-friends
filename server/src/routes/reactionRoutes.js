const express = require('express')
const router = express.Router({ mergeParams: true })
const { getReactions, addReaction } = require('../controllers/reactionController')
const { protect } = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const { z } = require('zod')

// Allowlist of permitted emojis — prevents arbitrary string storage
const ALLOWED_EMOJIS = ['👍', '❤️', '🔥', '😍', '🤔', '💸']
const reactionSchema = z.object({
  emoji: z.enum(ALLOWED_EMOJIS, { message: 'Invalid emoji — must be one of the allowed reactions' }),
})

router.use(protect)
router.get('/', getReactions)
router.post('/', validate(reactionSchema), addReaction)

module.exports = router
