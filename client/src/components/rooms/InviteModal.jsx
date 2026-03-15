import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, RefreshCw } from 'lucide-react'
import { regenerateInvite } from '../../api/rooms.api'
import { scaleIn } from '../../animations/variants'
import toast from 'react-hot-toast'

export default function InviteModal({ room, onClose, onRegenerated }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const inviteLink = `${window.location.origin}/join/${room.inviteCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied!')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    setLoading(true)
    try {
      const res = await regenerateInvite(room._id)
      onRegenerated(res.data.inviteCode)
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
            <h2 className="font-display text-xl font-bold">Invite Friends</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-[2.5px] border-black hover:bg-coral hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5">

            {/* Invite code display */}
            <div className="mb-4">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Invite Code
              </label>
              <div className="bg-purple border-[2.5px] border-black p-4 text-center">
                <span className="font-mono text-3xl font-bold text-white tracking-widest">
                  {room.inviteCode}
                </span>
              </div>
            </div>

            {/* Invite link */}
            <div className="mb-6">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Invite Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 border-[2.5px] border-black bg-cream px-3 py-2 font-mono text-xs truncate">
                  {inviteLink}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 border-[2.5px] border-black px-3 py-2 font-body text-sm font-semibold shadow-brut hover:shadow-brut-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Regenerate */}
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border-[2.5px] border-black font-body text-sm py-2.5 hover:bg-cream transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Regenerate code
            </button>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}