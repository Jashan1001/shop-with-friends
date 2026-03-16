const express = require('express')
const router = express.Router({ mergeParams: true })
const { getReactions, addReaction } = require('../controllers/reactionController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)
router.get('/', getReactions)
router.post('/', addReaction)

module.exports = router
