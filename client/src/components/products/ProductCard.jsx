import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import { ExternalLink, Trash2, CheckCircle, XCircle, Package, ShoppingBag, Shirt, ShoppingCart } from 'lucide-react'
import { slideUp } from '../../animations/variants'
import VoteButtons from './VoteButtons'
import ReactionBar from './ReactionBar'
import Badge from '../ui/Badge'
import formatPrice from '../../utils/formatPrice'
import timeAgo from '../../utils/timeAgo'
import { deleteProduct, updateProductStatus } from '../../api/products.api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  active:  { border: 'border-black',  shadow: 'shadow-brut-lg', bg: '' },
  bought:  { border: 'border-lime',   shadow: 'shadow-[6px_6px_0_#C6FF00]', bg: 'bg-bought-bg' },
  skipped: { border: 'border-coral',  shadow: 'shadow-coral',   bg: 'bg-skipped-bg' },
}

const PLATFORM_ICON = {
  amazon:   Package,
  flipkart: ShoppingBag,
  myntra:   Shirt,
  other:    ShoppingCart,
}

export default function ProductCard({ product, onClick, onVoteUpdate, onDelete, onStatusUpdate, isRoomOwner, isNew }) {
  const { user } = useAuthStore()
  const isProductOwner = product.addedBy?._id === user?.id
  const style = STATUS_STYLES[product.status] || STATUS_STYLES.active
  const ProductPlatformIcon = PLATFORM_ICON[product.platform] || PLATFORM_ICON.other

  // Sanitize all user-generated text before rendering
  const safeTitle    = DOMPurify.sanitize(product.title || '')
  const safeUsername = DOMPurify.sanitize(product.addedBy?.username || '')

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteProduct(product.roomId, product._id)
      onDelete?.(product._id)
      toast.success('Product deleted')
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const handleStatus = async (e, status) => {
    e.stopPropagation()
    try {
      const res = await updateProductStatus(product.roomId, product._id, status)
      onStatusUpdate?.(res.data.product)
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
      {/* Image */}
      {product.image ? (
        <div className="aspect-video border-b-[2.5px] border-black overflow-hidden">
          <img src={product.image} alt={safeTitle} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video border-b-[2.5px] border-black bg-cream flex items-center justify-center">
          <ProductPlatformIcon size={34} className="text-black/30" />
        </div>
      )}

      <div className="p-4">
        {/* Badge row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <Badge variant={product.platform || 'other'}>
            {product.platform || 'Other'}
          </Badge>
          {product.status !== 'active' && (
            <Badge variant={product.status}>{product.status}</Badge>
          )}
          {isNew && <Badge variant="new">New</Badge>}
        </div>

        {/* Title — sanitized */}
        <h3
          className="font-display text-base font-bold leading-tight mb-1 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: safeTitle }}
        />

        {/* Price */}
        <p className="font-mono text-lg font-bold mb-1">
          {formatPrice(product.price, product.currency)}
        </p>

        {/* Meta */}
        <p className="font-mono text-[11px] text-muted mb-3">
          @{safeUsername} · {timeAgo(product.createdAt)}
        </p>

        {/* Vote row + link */}
        <div className="flex items-center justify-between mb-3">
          <VoteButtons product={product} onVoteUpdate={onVoteUpdate} />
          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 font-mono text-xs text-muted border-[2px] border-black px-2 py-1 hover:bg-cream transition-colors"
            >
              <ExternalLink size={11} /> View
            </a>
          )}
        </div>

        {/* Reaction bar — stopPropagation so card click doesn't fire */}
        <div onClick={(e) => e.stopPropagation()} className="mb-3">
          <ReactionBar product={product} />
        </div>

        {/* Owner actions */}
        {(isProductOwner || isRoomOwner) && (
          <div className="mt-2 pt-3 border-t-[2px] border-black/10 flex items-center gap-2 flex-wrap">
            {isRoomOwner && product.status === 'active' && (
              <>
                <button
                  onClick={(e) => handleStatus(e, 'bought')}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase border-[2px] border-black px-2 py-1 hover:bg-lime transition-colors"
                >
                  <CheckCircle size={10} /> Bought
                </button>
                <button
                  onClick={(e) => handleStatus(e, 'skipped')}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase border-[2px] border-black px-2 py-1 hover:bg-coral hover:text-white transition-colors"
                >
                  <XCircle size={10} /> Skip
                </button>
              </>
            )}
            {isRoomOwner && product.status !== 'active' && (
              <button
                onClick={(e) => handleStatus(e, 'active')}
                className="font-mono text-[10px] uppercase border-[2px] border-black px-2 py-1 hover:bg-yellow transition-colors"
              >
                Mark Active
              </button>
            )}
            {(isProductOwner || isRoomOwner) && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 font-mono text-[10px] uppercase border-[2px] border-coral text-coral px-2 py-1 hover:bg-coral hover:text-white transition-colors ml-auto"
              >
                <Trash2 size={10} /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
