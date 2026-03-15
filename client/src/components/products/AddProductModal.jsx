import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { addProduct } from '../../api/products.api'
import errorMessage from '../../utils/errorMessage'
import { scaleIn } from '../../animations/variants'

const schema = z.object({
  title: z.string().min(1, 'Product title is required').max(200),
  price: z.string().optional(),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  platform: z.enum(['amazon', 'flipkart', 'myntra', 'other']).optional(),
  description: z.string().max(500).optional(),
})

export default function AddProductModal({ roomId, onClose, onAdded }) {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    try {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
      }
      const res = await addProduct(roomId, payload)
      onAdded(res.data.product)
      onClose()
    } catch (err) {
      setServerError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 z-40"
      />

      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white border-[2.5px] border-black shadow-brut-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between p-5 border-b-[2.5px] border-black sticky top-0 bg-white">
            <h2 className="font-display text-xl font-bold">Add Product</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-[2.5px] border-black hover:bg-coral hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">

            {serverError && (
              <div className="bg-coral text-white font-body text-sm p-3 border-[2.5px] border-black">
                {serverError}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Product Title *
              </label>
              <input
                {...register('title')}
                placeholder="Sony WH-1000XM5 Headphones"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
              {errors.title && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Price (₹)
              </label>
              <input
                {...register('price')}
                type="number"
                placeholder="29990"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Platform
              </label>
              <select
                {...register('platform')}
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              >
                <option value="">Select platform</option>
                <option value="amazon">Amazon</option>
                <option value="flipkart">Flipkart</option>
                <option value="myntra">Myntra</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Link */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Product Link
              </label>
              <input
                {...register('link')}
                placeholder="https://amazon.in/..."
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
              {errors.link && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">{errors.link.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Notes (optional)
              </label>
              <textarea
                {...register('description')}
                placeholder="Why you want this..."
                rows={2}
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow border-[2.5px] border-black font-body font-semibold text-sm py-3 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
            >
              {loading ? '...' : 'Add Product'}
            </button>

          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}