import { motion } from 'framer-motion'
import { ExternalLink, Trash2, CheckCircle, XCircle, Package, ShoppingBag, Shirt, ShoppingCart } from 'lucide-react'
import { slideUp } from '../../animations/variants'
import VoteButtons from './VoteButtons'
import formatPrice from '../../utils/formatPrice'
import timeAgo from '../../utils/timeAgo'
import { deleteProduct, updateProductStatus } from '../../api/products.api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  active:  { border: 'border-black', shadow: 'shadow-brut', bg: '' },
  bought:  { border: 'border-lime',  shadow: 'shadow-[6px_6px_0_#C6FF00]', bg: 'bg-bought-bg' },
  skipped: { border: 'border-coral', shadow: 'shadow-coral', bg: 'bg-skipped-bg' },
}

const PLATFORM_BADGE = {
  amazon:   { bg: 'bg-blue',   text: 'text-white', label: 'Amazon' },
  flipkart: { bg: 'bg-white',  text: 'text-black', label: 'Flipkart' },
  myntra:   { bg: 'bg-[#FF3E8A]', text: 'text-white', label: 'Myntra' },
  other:    { bg: 'bg-cream',  text: 'text-black', label: 'Other' },
}

const PLATFORM_ICON = {
  amazon: Package,
  flipkart: ShoppingBag,
  myntra: Shirt,
  other: ShoppingCart,
}

export default function ProductCard({ product, onClick, onVoteUpdate, onDelete, onStatusUpdate, isRoomOwner, isNew }) {
  const { user } = useAuthStore()
  const isProductOwner = product.addedBy?._id === user?.id
  const style = STATUS_STYLES[product.status] || STATUS_STYLES.active
  const badge = PLATFORM_BADGE[product.platform] || PLATFORM_BADGE.other
  const ProductPlatformIcon = PLATFORM_ICON[product.platform] || PLATFORM_ICON.other

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
      whileHover={{ x: -2, y: -2 }}
      onClick={() => onClick(product)}
      className={`bg-white border-[2.5px] ${isNew ? 'border-blue shadow-blue' : `${style.border} ${style.shadow}`} ${style.bg} cursor-pointer transition-all duration-300`}
    >
      {/* Image area */}
      {product.image ? (
        <div className="aspect-video border-b-[2.5px] border-black overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video border-b-[2.5px] border-black bg-cream flex items-center justify-center">
          <ProductPlatformIcon size={34} className="text-black" />
        </div>
      )}

      <div className="p-4">
        {/* Badge row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`font-mono text-[10px] font-bold uppercase tracking-widest border-[2px] border-black px-2 py-0.5 ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
          {product.status !== 'active' && (
            <span className={`font-mono text-[10px] font-bold uppercase tracking-widest border-[2px] border-black px-2 py-0.5
              ${product.status === 'bought' ? 'bg-lime text-black' : 'bg-coral text-white'}`}>
              {product.status}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold leading-tight mb-1 line-clamp-2">
          {product.title}
        </h3>

        {/* Price */}
        <p className="font-mono text-lg font-bold mb-2">
          {formatPrice(product.price, product.currency)}
        </p>

        {/* Meta */}
        <p className="font-mono text-[11px] text-muted mb-3">
          @{product.addedBy?.username} · {timeAgo(product.createdAt)}
        </p>

        {/* Vote row */}
        <div className="flex items-center justify-between">
          <VoteButtons product={product} onVoteUpdate={onVoteUpdate} />
          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 font-mono text-xs text-muted border-[2px] border-black px-2 py-1 hover:bg-cream transition-colors"
            >
              <ExternalLink size={11} />
              View
            </a>
          )}
        </div>

        {/* Owner actions */}
        {(isProductOwner || isRoomOwner) && (
          <div className="mt-3 pt-3 border-t-[2px] border-black/10 flex items-center gap-2 flex-wrap">
            {isRoomOwner && product.status === 'active' && (
              <>
                <button
                  onClick={(e) => handleStatus(e, 'bought')}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase border-[2px] border-black px-2 py-1 hover:bg-lime transition-colors"
                >
                  <CheckCircle size={10} />
                  Bought
                </button>
                <button
                  onClick={(e) => handleStatus(e, 'skipped')}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase border-[2px] border-black px-2 py-1 hover:bg-coral hover:text-white transition-colors"
                >
                  <XCircle size={10} />
                  Skip
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
                <Trash2 size={10} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}