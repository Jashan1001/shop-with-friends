const express = require('express')
const router  = express.Router({ mergeParams: true })

const {
  addProduct, getProducts,
  updateProduct, deleteProduct, updateStatus,
  uploadProductImage: uploadProductImageController,
} = require('../controllers/productController')

const { protect }                        = require('../middleware/authMiddleware')
const { isMember, isOwner }              = require('../middleware/roomMiddleware')
const validate                           = require('../middleware/validate')
const { uploadProductImage }             = require('../middleware/upload')
const {
  addProductSchema, updateProductSchema, updateStatusSchema,
} = require('../schemas/productSchemas')

router.use(protect)

router.post('/',           isMember, validate(addProductSchema),    addProduct)
router.get('/',            isMember, getProducts)
router.put('/:id',         isMember, validate(updateProductSchema), updateProduct)
router.delete('/:id',      isMember, deleteProduct)
router.put('/:id/status',  isOwner,  validate(updateStatusSchema),  updateStatus)

// Image upload — member can upload an image for any product in the room
// Returns { imageUrl } — client sets it on the product via updateProduct
router.post('/:id/image',  isMember, uploadProductImage, uploadProductImageController)

module.exports = router