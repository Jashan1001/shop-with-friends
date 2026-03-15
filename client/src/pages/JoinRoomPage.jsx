import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { joinRoom } from '../api/rooms.api'
import errorMessage from '../utils/errorMessage'
import { slideUp } from '../animations/variants'
import api from '../api/axios'

export default function JoinRoomPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [room, setRoom] = useState(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const preview = async () => {
      try {
        const res = await api.get(`/rooms/preview/${code}`)
        setRoom(res.data.room)
      } catch (err) {
        setError(errorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    preview()
  }, [code])

  const handleJoin = async () => {
    setJoining(true)
    try {
      const res = await joinRoom(code)
      navigate(`/room/${res.data.room._id}`, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="font-mono text-sm text-muted">Loading invite...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="font-display text-2xl font-bold mb-2">Invalid invite</h2>
          <p className="font-mono text-sm text-coral mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-6 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-8">
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        className="bg-white border-[2.5px] border-black shadow-brut-xl p-8 w-full max-w-sm text-center"
      >
        <div className="text-5xl mb-4">{room?.emoji}</div>
        <h2 className="font-display text-2xl font-bold mb-1">{room?.name}</h2>
        {room?.description && (
          <p className="font-body text-sm text-muted mb-2">{room.description}</p>
        )}
        <p className="font-mono text-xs text-muted mb-6">
          {room?.members?.length} member{room?.members?.length !== 1 ? 's' : ''}
        </p>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full bg-yellow border-[2.5px] border-black font-body font-semibold text-sm py-3 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
        >
          {joining ? '...' : 'Join Room'}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-3 border-[2.5px] border-black font-body text-sm py-2.5 hover:bg-cream transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  )
}