import { useState } from 'react'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import {
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  ShoppingBag,
  Shirt,
  ShoppingCart,
  Camera,
  Loader2,
} from 'lucide-react'
import { slideUp } from '../../animations/variants'
import VoteButtons from './VoteButtons'
import ReactionBar from './ReactionBar'
import Badge from '../ui/Badge'
import formatPrice from '../../utils/formatPrice'
import timeAgo from '../../utils/timeAgo'
import {
  deleteProduct,
  updateProduct,
  updateProductStatus,
  uploadProductImage,
} from '../../api/products.api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  active: { border: 'border-black', shadow: 'shadow-brut-lg', bg: '' },
  bought: { border: 'border-lime', shadow: 'shadow-[6px_6px_0_#C6FF00]', bg: 'bg-bought-bg' },
  skipped: { border: 'border-coral', shadow: 'shadow-coral', bg: 'bg-skipped-bg' },
}

const PLATFORM_ICON = {
  amazon: Package,
  flipkart: ShoppingBag,
  myntra: Shirt,
  other: ShoppingCart,
}

export default function ProductCard({
  product,
  onClick,
  onVoteUpdate,
  onDelete,
  onStatusUpdate,
  isRoomOwner,
  isNew,
}) {
  const { user } = useAuthStore()
  const [imgUploading, setImgUploading] = useState(false)
  const [localImage, setLocalImage] = useState(product.image || '')

  const isProductOwner = product.addedBy?._id === user?.id
  const style = STATUS_STYLES[product.status] || STATUS_STYLES.active
  const ProductPlatformIcon = PLATFORM_ICON[product.platform] || PLATFORM_ICON.other

  const safeTitle = DOMPurify.sanitize(product.title || '')
  const safeUsername = DOMPurify.sanitize(product.addedBy?.username || '')

  const handleImageUpload = async (event) => {
    event.stopPropagation()

    const file = event.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setLocalImage(previewUrl)
    setImgUploading(true)

    try {
      const imageResponse = await uploadProductImage(product.roomId, product._id, file)
      const imageUrl = imageResponse.data.imageUrl
      const updateResponse = await updateProduct(product.roomId, product._id, { image: imageUrl })

      setLocalImage(imageUrl)
      onStatusUpdate?.(updateResponse.data.product)
      toast.success('Image updated')
    } catch {
      setLocalImage(product.image || '')
      toast.error('Image upload failed')
    } finally {
      URL.revokeObjectURL(previewUrl)
      setImgUploading(false)
      event.target.value = ''
    }
  }

  const handleDelete = async (event) => {
    event.stopPropagation()
    if (!window.confirm('Delete this product?')) return

    try {
      await deleteProduct(product.roomId, product._id)
      onDelete?.(product._id)
      toast.success('Product deleted')
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const handleStatus = async (event, status) => {
    event.stopPropagation()

    try {
      const response = await updateProductStatus(product.roomId, product._id, status)
      onStatusUpdate?.(response.data.product)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <motion.div
      variants={slideUp}
      whileHover={{ x: -3, y: -3 }}
      onClick={() => onClick(product)}
      className={`
        bg-white border-[2.5px] cursor-pointer transition-all duration-[120ms]
        hover:shadow-brut-xl
        ${isNew ? 'border-blue shadow-[0_0_0_2px_#2979FF]' : `${style.border} ${style.shadow}`}
        ${style.bg}
      `}
    >
      {localImage || product.image ? (
        <div className="aspect-video border-b-[2.5px] border-black overflow-hidden relative group">
          <img src={localImage || product.image} alt={safeTitle} className="w-full h-full object-cover" />
          {(isProductOwner || isRoomOwner) && (
            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {imgUploading ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onClick={(event) => event.stopPropagation()}
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      ) : (
        <div className="aspect-video border-b-[2.5px] border-black bg-cream flex items-center justify-center relative group">
          <ProductPlatformIcon size={34} className="text-black/30" />
          {(isProductOwner || isRoomOwner) && (
            <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/10">
              {imgUploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera size={18} className="text-black/60" />
                  <span className="font-mono text-[10px] text-black/60">Add image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onClick={(event) => event.stopPropagation()}
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <Badge variant={product.platform || 'other'}>
            {product.platform || 'Other'}
          </Badge>
          {product.status !== 'active' && <Badge variant={product.status}>{product.status}</Badge>}
          {isNew && <Badge variant="new">New</Badge>}
        </div>

        <h3
          className="font-display text-base font-bold leading-tight mb-1 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: safeTitle }}
        />

        <p className="font-mono text-lg font-bold mb-1">
          {formatPrice(product.price, product.currency)}
        </p>

        <p className="font-mono text-[11px] text-muted mb-3">
          @{safeUsername} · {timeAgo(product.createdAt)}
        </p>

        <div className="flex items-center justify-between mb-3">
          <VoteButtons product={product} onVoteUpdate={onVoteUpdate} />
          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="flex items-center gap-1 font-mono text-xs text-muted border-[2px] border-black px-2 py-1 hover:bg-cream transition-colors"
            >
              <ExternalLink size={11} /> View
            </a>
          )}
        </div>

        <div onClick={(event) => event.stopPropagation()} className="mb-3">
          <ReactionBar product={product} />
        </div>

        {(isProductOwner || isRoomOwner) && (
          <div className="mt-2 pt-3 border-t-[2px] border-black/10 flex items-center gap-2 flex-wrap">
            {isRoomOwner && product.status === 'active' && (
              <>
                <button
                  onClick={(event) => handleStatus(event, 'bought')}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase border-[2px] border-black px-2 py-1 hover:bg-lime transition-colors"
                >
                  <CheckCircle size={10} /> Bought
                </button>
                <button
                  onClick={(event) => handleStatus(event, 'skipped')}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase border-[2px] border-black px-2 py-1 hover:bg-coral hover:text-white transition-colors"
                >
                  <XCircle size={10} /> Skip
                </button>
              </>
            )}

            {isRoomOwner && product.status !== 'active' && (
              <button
                onClick={(event) => handleStatus(event, 'active')}
                className="font-mono text-[10px] uppercase border-[2px] border-black px-2 py-1 hover:bg-yellow transition-colors"
              >
                Mark Active
              </button>
            )}

            <button
              onClick={handleDelete}
              className="flex items-center gap-1 font-mono text-[10px] uppercase border-[2px] border-coral text-coral px-2 py-1 hover:bg-coral hover:text-white transition-colors ml-auto"
            >
              <Trash2 size={10} /> Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
