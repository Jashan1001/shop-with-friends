const express = require('express')
const router = express.Router({ mergeParams: true })

const {
  addProduct, getProducts,
  updateProduct, deleteProduct, updateStatus,
} = require('../controllers/productController')

const { protect } = require('../middleware/authMiddleware')
const { isMember, isOwner } = require('../middleware/roomMiddleware')
const validate = require('../middleware/validate')
const {
  addProductSchema, updateProductSchema, updateStatusSchema
} = require('../schemas/productSchemas')

router.use(protect)

router.post('/',     isMember, validate(addProductSchema),    addProduct)
router.get('/',      isMember, getProducts)
router.put('/:id',   isMember, validate(updateProductSchema), updateProduct)
router.delete('/:id',isMember, deleteProduct)
router.put('/:id/status', isOwner, validate(updateStatusSchema), updateStatus)

module.exports = router