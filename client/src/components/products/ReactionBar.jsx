import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'

const EMOJIS = ['👍', '❤️', '🔥', '😍', '🤔', '💸']

// Fetch reactions for a product
const getReactions = (productId) =>
  api.get(`/products/${productId}/reactions`).then((r) => r.data.reactions)

// Add / toggle reaction
const addReaction = (productId, emoji) =>
  api.post(`/products/${productId}/reactions`, { emoji }).then((r) => r.data.reactions)

export default function ReactionBar({ product }) {
  const queryClient = useQueryClient()
  const [floatingEmojis, setFloatingEmojis] = useState([])

  const { data: reactions = [] } = useQuery({
    queryKey: ['reactions', product._id],
    queryFn: () => getReactions(product._id),
    staleTime: 30_000,
  })

  const triggerFloat = useCallback((emoji) => {
    const id = Date.now() + Math.random()
    setFloatingEmojis((prev) => [...prev, { id, emoji }])
    setTimeout(() => setFloatingEmojis((prev) => prev.filter((f) => f.id !== id)), 900)
  }, [])

  const handleReact = async (emoji) => {
    const isRemoving = getReactionData(emoji).hasReacted
    // Only float when ADDING a reaction, not when removing (toggling off)
    if (!isRemoving) triggerFloat(emoji)
    try {
      const updated = await addReaction(product._id, emoji)
      queryClient.setQueryData(['reactions', product._id], updated)
    } catch (err) {
      console.error('Reaction failed', err)
    }
  }

  // Called by useRoom when reaction:burst socket event fires
  // Parent can call: queryClient.setQueryData(['reactions', productId], reactions)
  // — handled in useRoom hook extension below

  const getReactionData = (emoji) =>
    reactions.find((r) => r.emoji === emoji) || { count: 0, hasReacted: false }

  return (
    <div className="relative">
      {/* Floating emoji animations */}
      <AnimatePresence>
        {floatingEmojis.map(({ id, emoji }) => (
          <motion.div
            key={id}
            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            animate={{ opacity: 0, y: -48, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute bottom-8 left-2 pointer-events-none z-10 text-xl select-none"
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Emoji picker row */}
      <div className="flex items-center gap-1 flex-wrap">
        {EMOJIS.map((emoji) => {
          const { count, hasReacted } = getReactionData(emoji)
          return (
            <motion.button
              key={emoji}
              whileHover={{ x: -1, y: -1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); handleReact(emoji) }}
              className={`
                flex items-center gap-1 px-2 py-1
                border-[2px] border-black font-mono text-[11px] font-bold
                transition-all duration-100
                ${hasReacted
                  ? 'bg-yellow shadow-[2px_2px_0_#0A0A0A]'
                  : 'bg-white hover:bg-cream'
                }
              `}
            >
              <span className="text-sm leading-none">{emoji}</span>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
