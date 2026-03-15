const express = require('express')
const router = express.Router({ mergeParams: true })

const { vote, removeVote } = require('../controllers/voteController')
const { protect } = require('../middleware/authMiddleware')
const { z } = require('zod')
const validate = require('../middleware/validate')

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
})

router.use(protect)
router.post('/',   validate(voteSchema), vote)
router.delete('/', removeVote)

module.exports = router