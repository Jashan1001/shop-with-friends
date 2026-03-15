import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { slideUp } from '../../animations/variants'
import { useAuthStore } from '../../store/authStore'

export default function RoomCard({ room }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isOwner = room.createdBy._id === user?.id

  return (
    <motion.div
      variants={slideUp}
      whileHover={{ x: -2, y: -2 }}
      onClick={() => navigate(`/room/${room._id}`)}
      className="bg-white border-[2.5px] border-black shadow-brut hover:shadow-brut-xl transition-shadow cursor-pointer p-5"
    >
      {/* Emoji + name */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{room.emoji}</span>
        {/* Owner badge */}
        {isOwner && (
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-purple text-white border-[2px] border-black px-2 py-0.5">
            Owner
          </span>
        )}
      </div>

      <h3 className="font-display text-lg font-bold leading-tight mb-1">
        {room.name}
      </h3>

      {room.description && (
        <p className="font-body text-sm text-muted mb-4 line-clamp-2">
          {room.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-auto">
        <span className="font-mono text-xs text-muted">
          {room.members.length} member{room.members.length !== 1 ? 's' : ''}
        </span>
        <span className="font-mono text-xs text-muted">
          {new Date(room.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Invite code */}
      <div className="mt-3 pt-3 border-t-[2.5px] border-black">
        <span className="font-mono text-xs text-muted uppercase tracking-widest">
          Code: {room.inviteCode}
        </span>
      </div>
    </motion.div>
  )
}