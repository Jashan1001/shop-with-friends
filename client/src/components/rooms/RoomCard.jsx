import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { slideUp } from '../../animations/variants'
import { useAuthStore } from '../../store/authStore'
import { getRoomIconOption } from '../../utils/roomIcons'

export default function RoomCard({ room }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isOwner = room.createdBy._id === user?.id
  const RoomIcon = getRoomIconOption(room.emoji).icon

  return (
    <motion.div
      variants={slideUp}
      whileHover={{ x: -3, y: -3 }}
      onClick={() => navigate(`/room/${room._id}`)}
      className="bg-white border-[2.5px] border-black shadow-brut hover:shadow-brut-xl transition-shadow cursor-pointer p-5"
    >
      {/* Icon + name */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 bg-yellow border-[2.5px] border-black flex items-center justify-center">
          <RoomIcon size={22} className="text-black" />
        </div>
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