import { useState }                    from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import { useForm }                     from 'react-hook-form'
import { zodResolver }                 from '@hookform/resolvers/zod'
import { z }                           from 'zod'
import { X, Search, Loader2, ImagePlus } from 'lucide-react'
import toast                           from 'react-hot-toast'
import { addProduct, uploadProductImage } from '../../api/products.api'
import errorMessage                    from '../../utils/errorMessage'
import { scaleIn }                     from '../../animations/variants'
import { useProductScraper }           from '../../hooks/useProductScraper'

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(200),
  price:       z.string().optional(),
  link:        z.string().optional().default(''),
  platform:    z.enum(['amazon', 'flipkart', 'myntra', 'other']).default('other'),
  description: z.string().max(500).optional().default(''),
})

const PLATFORMS = ['amazon', 'flipkart', 'myntra', 'other']

export default function AddProductModal({ roomId, onClose, onAdded }) {
  const [loading, setLoading]             = useState(false)
  const [serverError, setServerError]     = useState('')
  const [urlInput, setUrlInput]           = useState('')
  const [imageFile, setImageFile]         = useState(null)
  const [imagePreview, setImagePreview]   = useState('')
  const [scrapedImage, setScrapedImage]   = useState('')
  const { scrape, loading: scrapeLoading, error: scrapeError } = useProductScraper()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { platform: 'other' },
  })

  // Pick the best image to show: local file upload > scraped URL
  const previewSrc = imagePreview || scrapedImage

  const handleScrape = async () => {
    if (!urlInput.trim()) return
    const data = await scrape(urlInput)
    if (!data) return

    if (data.title)       setValue('title', data.title)
    if (data.price)       setValue('price', String(data.price))
    if (data.platform)    setValue('platform', data.platform)
    if (data.description) setValue('description', data.description)
    setValue('link', urlInput)
    if (data.image) setScrapedImage(data.image)

    if (data.error) toast.error(data.error)
    else toast.success('Page scraped — check and edit the details')
  }

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    try {
      // 1. Create the product first (image field left empty for now)
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        image: scrapedImage, // use scraped URL as default
      }
      const res = await addProduct(roomId, payload)
      const product = res.data.product

      // 2. If user picked a local file, upload it and patch the product
      if (imageFile) {
        try {
          const imgRes = await uploadProductImage(roomId, product._id, imageFile)
          product.image = imgRes.data.imageUrl

          // Patch the product with the Cloudinary URL
          const { updateProduct } = await import('../../api/products.api')
          await updateProduct(roomId, product._id, { image: product.image })
        } catch {
          toast.error('Product added but image upload failed')
        }
      }

      toast.success('Product added!')
      onAdded(product)
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

            {/* URL scraper */}
            <div className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Paste Product URL
              </label>
              <div className="flex gap-2">
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                  placeholder="https://amazon.in/..."
                  className="flex-1 border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={scrapeLoading}
                  className="flex items-center gap-1.5 bg-black text-white font-body text-sm px-3 py-2.5 border-[2.5px] border-black hover:bg-black/80 disabled:opacity-50 transition-colors"
                >
                  {scrapeLoading
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Search size={14} />}
                  Fetch
                </button>
              </div>
              {scrapeError && (
                <p className="font-mono text-[11px] text-coral mt-1">{scrapeError}</p>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Image preview + upload */}
              <div className="mb-4">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                  Product Image
                </label>

                {previewSrc ? (
                  <div className="relative border-[2.5px] border-black aspect-video overflow-hidden mb-2">
                    <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); setScrapedImage('') }}
                      className="absolute top-2 right-2 bg-white border-[2px] border-black w-6 h-6 flex items-center justify-center hover:bg-coral hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-[2.5px] border-dashed border-black aspect-video cursor-pointer hover:bg-cream transition-colors mb-2">
                    <ImagePlus size={24} className="text-black/30 mb-2" />
                    <span className="font-mono text-[11px] text-muted">Click to upload image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageFile}
                    />
                  </label>
                )}

                {/* Allow replacing with a file even after scrape */}
                {previewSrc && (
                  <label className="flex items-center gap-1.5 font-mono text-[11px] text-muted cursor-pointer hover:text-black transition-colors">
                    <ImagePlus size={12} />
                    Replace with your own image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageFile}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                  Title <span className="text-coral">*</span>
                </label>
                <input
                  {...register('title')}
                  className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
                />
                {errors.title && (
                  <p className="font-mono text-[11px] text-coral mt-1">{errors.title.message}</p>
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
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
                />
              </div>

              {/* Platform */}
              <div className="mb-4">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                  Platform
                </label>
                <select
                  {...register('platform')}
                  className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow appearance-none"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Optional notes about this product"
                  className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut resize-none transition-shadow"
                />
                <p className="font-mono text-[10px] text-muted mt-1">
                  {watch('description')?.length || 0}/500
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow border-[2.5px] border-black font-body font-semibold text-sm py-3 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Adding…' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
