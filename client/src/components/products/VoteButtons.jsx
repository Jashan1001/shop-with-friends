import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { vote, removeVote } from '../../api/votes.api'

export default function VoteButtons({ product, onVoteUpdate }) {
  const [loading, setLoading] = useState(false)

  const userVote = product.userVote // 1, -1, or null

  const handleVote = async (value) => {
    if (loading) return
    setLoading(true)

    try {
      // If clicking same vote — remove it
      if (userVote === value) {
        await removeVote(product._id)
        onVoteUpdate(product._id, {
          upvotes: value === 1 ? product.upvotes - 1 : product.upvotes,
          downvotes: value === -1 ? product.downvotes - 1 : product.downvotes,
          userVote: null,
        })
      } else {
        await vote(product._id, value)
        onVoteUpdate(product._id, {
          upvotes: value === 1
            ? product.upvotes + 1
            : userVote === 1 ? product.upvotes - 1 : product.upvotes,
          downvotes: value === -1
            ? product.downvotes + 1
            : userVote === -1 ? product.downvotes - 1 : product.downvotes,
          userVote: value,
        })
      }
    } catch (err) {
      console.error('Vote failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Upvote */}
      <motion.button
        whileHover={{ x: -2, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 border-[2.5px] border-black font-mono text-xs font-bold transition-all
          ${userVote === 1
            ? 'bg-lime shadow-brut'
            : 'bg-white hover:bg-lime/30'
          }`}
      >
        <ChevronUp size={14} />
        <motion.span
          key={product.upvotes}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {product.upvotes}
        </motion.span>
      </motion.button>

      {/* Downvote */}
      <motion.button
        whileHover={{ x: -2, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 border-[2.5px] border-black font-mono text-xs font-bold transition-all
          ${userVote === -1
            ? 'bg-coral text-white border-coral'
            : 'bg-white hover:bg-coral/20'
          }`}
      >
        <ChevronDown size={14} />
        <motion.span
          key={product.downvotes}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {product.downvotes}
        </motion.span>
      </motion.button>
    </div>
  )
}