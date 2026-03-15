import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { createRoom } from '../../api/rooms.api'
import errorMessage from '../../utils/errorMessage'
import { scaleIn } from '../../animations/variants'
import toast from 'react-hot-toast'

const EMOJIS = ['🛒', '💻', '👟', '📱', '🏠', '👗', '🎮', '📚', '🍕', '✈️']

const schema = z.object({
  name: z.string().min(1, 'Room name is required').max(60),
  description: z.string().max(200).optional(),
  emoji: z.string().optional(),
})

export default function CreateRoomModal({ onClose, onCreated }) {
  const [selectedEmoji, setSelectedEmoji] = useState('🛒')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { emoji: '🛒' },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await createRoom({ ...data, emoji: selectedEmoji })
      toast.success('Room created!')
      onCreated(res.data.room)
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
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 z-40"
      />

      {/* Modal */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white border-[2.5px] border-black shadow-brut-xl w-full max-w-md">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b-[2.5px] border-black">
            <h2 className="font-display text-xl font-bold">Create Room</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-[2.5px] border-black hover:bg-coral hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-5">

            {serverError && (
              <div className="bg-coral text-white font-body text-sm p-3 mb-4 border-[2.5px] border-black">
                {serverError}
              </div>
            )}

            {/* Emoji picker */}
            <div className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-2">
                Pick an emoji
              </label>
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-xl w-10 h-10 flex items-center justify-center border-[2.5px] border-black transition-all
                      ${selectedEmoji === emoji
                        ? 'bg-yellow shadow-brut'
                        : 'bg-white hover:bg-cream'
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Room name */}
            <div className="mb-4">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Room Name
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Laptop Shopping"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
              {errors.name && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Description (optional)
              </label>
              <textarea
                {...register('description')}
                placeholder="What are you shopping for?"
                rows={2}
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow border-[2.5px] border-black font-body font-semibold text-sm py-3 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
            >
              {loading ? '...' : 'Create Room'}
            </button>

          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}