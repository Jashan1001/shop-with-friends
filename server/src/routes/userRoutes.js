const express = require('express')
const router = express.Router()
const { updateProfile, changePassword } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const { z } = require('zod')

const profileSchema = z.object({
  name: z.string().min(1).max(50),
  bio: z.string().max(160).optional().default(''),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
})

router.use(protect)
router.put('/profile', validate(profileSchema), updateProfile)
router.put('/password', validate(passwordSchema), changePassword)

module.exports = router