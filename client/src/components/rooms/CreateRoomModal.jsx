import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { createRoom } from '../../api/rooms.api'
import errorMessage from '../../utils/errorMessage'
import { scaleIn } from '../../animations/variants'
import { ROOM_ICON_OPTIONS } from '../../utils/roomIcons'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Room name is required').max(60),
  description: z.string().max(200).optional(),
})

export default function CreateRoomModal({ onClose, onCreated }) {
  const [selectedIcon, setSelectedIcon] = useState('cart')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await createRoom({ ...data, emoji: selectedIcon })
      toast.success('Room created!')
      onCreated(res.data.room)
      onClose()
    } catch (err) {
      setServerError(errorMessage(err))
      toast.error(errorMessage(err))
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

          <form onSubmit={handleSubmit(onSubmit)} className="p-5">

            {serverError && (
              <div className="bg-coral text-white font-body text-sm p-3 mb-4 border-[2.5px] border-black">
                {serverError}
              </div>
            )}

            {/* Icon picker */}
            <div className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-2">
                Room Type
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ROOM_ICON_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedIcon(option.value)}
                      className={`flex flex-col items-center gap-1 p-2.5 border-[2.5px] border-black transition-all
                        ${selectedIcon === option.value
                          ? 'bg-yellow shadow-brut'
                          : 'bg-white hover:bg-cream'
                        }`}
                    >
                      <Icon size={18} className="text-black" />
                      <span className="font-mono text-[9px] uppercase">{option.label}</span>
                    </button>
                  )
                })}
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