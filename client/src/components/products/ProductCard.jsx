import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { slideUp } from '../../animations/variants'
import VoteButtons from './VoteButtons'
import formatPrice from '../../utils/formatPrice'
import timeAgo from '../../utils/timeAgo'

const STATUS_STYLES = {
  active:  { border: 'border-black', shadow: 'shadow-brut', bg: '' },
  bought:  { border: 'border-lime',  shadow: 'shadow-[6px_6px_0_#C6FF00]', bg: 'bg-[#F0FFF0]' },
  skipped: { border: 'border-coral', shadow: 'shadow-coral', bg: 'bg-[#FFF0F0]' },
}

const PLATFORM_BADGE = {
  amazon:   { bg: 'bg-blue',   text: 'text-white', label: 'Amazon' },
  flipkart: { bg: 'bg-white',  text: 'text-black', label: 'Flipkart' },
  myntra:   { bg: 'bg-[#FF3E8A]', text: 'text-white', label: 'Myntra' },
  other:    { bg: 'bg-cream',  text: 'text-black', label: 'Other' },
}

export default function ProductCard({ product, onClick, onVoteUpdate }) {
  const style = STATUS_STYLES[product.status] || STATUS_STYLES.active
  const badge = PLATFORM_BADGE[product.platform] || PLATFORM_BADGE.other

  return (
    <motion.div
      variants={slideUp}
      whileHover={{ x: -3, y: -3 }}
      onClick={() => onClick(product)}
      className={`bg-white border-[2.5px] ${style.border} ${style.shadow} ${style.bg} cursor-pointer transition-shadow hover:shadow-brut-xl`}
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
          <span className="text-4xl">
            {product.platform === 'amazon' ? '📦'
              : product.platform === 'flipkart' ? '🛍️'
              : product.platform === 'myntra' ? '👗'
              : '🛒'}
          </span>
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
      </div>
    </motion.div>
  )
}