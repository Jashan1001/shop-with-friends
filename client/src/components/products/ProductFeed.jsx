import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'
import { stagger, slideUp } from '../../animations/variants'

export default function ProductFeed({
  products = [],
  isLoading,
  isOwner,
  newProductIds,
  onProductClick,
  onVoteUpdate,
  onDelete,
  onStatusUpdate,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        className="border-[2.5px] border-black border-dashed p-16 text-center"
      >
        <div className="w-14 h-14 bg-yellow border-[2.5px] border-black mx-auto flex items-center justify-center mb-3 shadow-brut">
          <Package size={24} className="text-black" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">No products yet</h3>
        <p className="font-body text-muted text-sm">Add the first product to start voting.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onClick={onProductClick}
          onVoteUpdate={onVoteUpdate}
          onDelete={onDelete}
          onStatusUpdate={onStatusUpdate}
          isRoomOwner={isOwner}
          isNew={newProductIds?.has(product._id)}
        />
      ))}
    </motion.div>
  )
}
