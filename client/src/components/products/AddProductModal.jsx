import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Search, Loader2 } from 'lucide-react'
import { addProduct } from '../../api/products.api'
import errorMessage from '../../utils/errorMessage'
import { scaleIn } from '../../animations/variants'
import { useProductScraper } from '../../hooks/useProductScraper'
import toast from 'react-hot-toast'

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(200),
  price:       z.string().optional(),
  link:        z.string().optional().default(''),
  platform:    z.enum(['amazon', 'flipkart', 'myntra', 'other']).default('other'),
  description: z.string().max(500).optional().default(''),
})

const PLATFORMS = ['amazon', 'flipkart', 'myntra', 'other']

export default function AddProductModal({ roomId, onClose, onAdded }) {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const { scrape, loading: scrapeLoading, error: scrapeError } = useProductScraper()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { platform: 'other' },
  })

  const handleScrape = async () => {
    if (!urlInput.trim()) return
    const data = await scrape(urlInput)
    if (!data) return

    // Auto-fill form fields from scraped data
    if (data.title)    setValue('title', data.title)
    if (data.price)    setValue('price', String(data.price))
    if (data.platform) setValue('platform', data.platform)
    if (data.description) setValue('description', data.description)
    setValue('link', urlInput)

    if (data.error) toast.error(data.error)
    else toast.success('Page scraped — check and edit the details')
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    try {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        image: '', // image upload is separate (Cloudinary)
      }
      const res = await addProduct(roomId, payload)
      toast.success('Product added!')
      onAdded(res.data.product)
      onClose()
    } catch (err) {
      const message = errorMessage(err)
      setServerError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 z-40"
      />
      <motion.div
        variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <div
          className="bg-white border-[2.5px] border-black shadow-brut-xl w-full sm:max-w-md max-h-[92dvh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b-[2.5px] border-black sticky top-0 bg-white z-10">
            <h2 className="font-display text-xl font-bold">Add Product</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-[2.5px] border-black hover:bg-coral hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5">
            {serverError && (
              <div className="bg-coral text-white font-body text-sm p-3 mb-4 border-[2.5px] border-black">
                {serverError}
              </div>
            )}

            {/* URL Scraper */}
            <div className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Paste Product URL (auto-fill)
              </label>
              <div className="flex gap-2">
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleScrape())}
                  placeholder="https://amazon.in/..."
                  className="flex-1 border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={scrapeLoading || !urlInput.trim()}
                  className="flex items-center gap-1.5 bg-black text-white border-[2.5px] border-black font-body font-semibold text-sm px-3 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
                >
                  {scrapeLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {scrapeLoading ? '' : 'Fill'}
                </button>
              </div>
              {scrapeError && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">{scrapeError}</p>
              )}
              <p className="font-mono text-[10px] text-muted mt-1">
                Works best with open graph tags. Amazon may block — fill manually as fallback.
              </p>
            </div>

            <div className="border-t-[2px] border-black/10 pt-4 mb-4">
              <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                Or fill in manually
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Platform */}
              <div className="mb-4">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-2">
                  Platform
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PLATFORMS.map((p) => (
                    <label key={p} className="cursor-pointer">
                      <input {...register('platform')} type="radio" value={p} className="sr-only" />
                      <span
                        className={`font-mono text-xs uppercase border-[2.5px] border-black px-3 py-1.5 block transition-colors
                          ${watch('platform') === p ? 'bg-yellow font-bold shadow-brut' : 'bg-white hover:bg-cream'}`}
                      >
                        {p}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                  Product Title *
                </label>
                <input
                  {...register('title')}
                  placeholder="MacBook Air M2"
                  className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
                />
                {errors.title && (
                  <p className="font-mono text-[11px] text-coral uppercase mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                  Price (₹)
                </label>
                <input
                  {...register('price')}
                  type="number"
                  placeholder="114900"
                  className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
                />
              </div>

              {/* Link */}
              <div className="mb-4">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                  Product Link (optional)
                </label>
                <input
                  {...register('link')}
                  placeholder="https://amazon.in/..."
                  className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Why this product?"
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
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
