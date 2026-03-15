const express = require('express')
const router = express.Router({ mergeParams: true })

const { addComment, getComments, deleteComment } = require('../controllers/commentController')
const { protect } = require('../middleware/authMiddleware')
const { z } = require('zod')
const validate = require('../middleware/validate')

const commentSchema = z.object({
  text: z.string().min(1).max(500),
})

router.use(protect)
router.post('/',                validate(commentSchema), addComment)
router.get('/',                 getComments)
router.delete('/:commentId',    deleteComment)

module.exports = router