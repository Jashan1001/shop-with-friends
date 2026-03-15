import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, UserPlus, Plus, Users } from 'lucide-react'
import { getRoom } from '../../api/rooms.api'
import { getProducts } from '../../api/products.api'
import { useAuthStore } from '../../store/authStore'
import InviteModal from '../../components/rooms/InviteModal'
import { stagger, slideUp } from '../../animations/variants'

export default function RoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [showInvite, setShowInvite] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  // Fetch room details
  const { data: roomData, isLoading: roomLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoom(roomId).then((res) => res.data.room),
  })

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', roomId],
    queryFn: () => getProducts(roomId).then((res) => res.data.products),
    enabled: !!roomId,
  })

  const isOwner = roomData?.createdBy?._id === user?.id

  const handleInviteRegenerated = (newCode) => {
    queryClient.setQueryData(['room', roomId], (old) => ({
      ...old,
      inviteCode: newCode,
    }))
  }

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="font-mono text-sm text-muted">Loading room...</span>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="font-mono text-sm text-coral">Room not found.</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Top navbar */}
      <div className="border-b-[2.5px] border-black bg-white px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 font-body text-sm border-[2.5px] border-black px-3 py-1.5 shadow-brut hover:shadow-brut-lg transition-shadow hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{roomData.emoji}</span>
          <h1 className="font-display text-xl font-bold">{roomData.name}</h1>
          {isOwner && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-purple text-white border-[2px] border-black px-2 py-0.5">
              Owner
            </span>
          )}
        </div>

        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-4 py-1.5 shadow-brut hover:shadow-brut-lg transition-shadow"
        >
          <UserPlus size={14} />
          Invite
        </button>
      </div>

      {/* Main 3-zone layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — members */}
        <div className="w-60 flex-shrink-0 border-r-[2.5px] border-black bg-black flex flex-col">
          <div className="p-4 border-b-[2px] border-white/10">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-white/40" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                Members ({roomData.members.length})
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {roomData.members.map((member) => (
              <div key={member._id} className="flex items-center gap-2.5 py-2">
                {/* Avatar */}
                <div className="w-7 h-7 bg-yellow border-[2px] border-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-[10px] font-bold text-black">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-body text-xs text-white truncate">
                    {member.name}
                  </div>
                  <div className="font-mono text-[10px] text-white/40 truncate">
                    @{member.username}
                  </div>
                </div>
                {/* Owner indicator */}
                {member._id === roomData.createdBy._id && (
                  <span className="font-mono text-[8px] bg-purple text-white px-1 ml-auto flex-shrink-0">
                    OWN
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main feed */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Feed header */}
          <div className="border-b-[2.5px] border-black bg-white px-6 py-3 flex items-center justify-between flex-shrink-0">

            {/* Sort tabs */}
            <div className="flex gap-0">
              {['newest', 'top'].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border-[2px] border-black transition-colors
                    ${sortBy === sort ? 'bg-yellow font-bold' : 'bg-white hover:bg-cream'}`}
                >
                  {sort === 'newest' ? 'Newest' : 'Top Voted'}
                </button>
              ))}
            </div>

            <button
              className="flex items-center gap-2 bg-black text-white border-[2.5px] border-black font-body font-semibold text-sm px-4 py-1.5 shadow-brut hover:shadow-brut-lg transition-shadow"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>

          {/* Product feed */}
          <div className="flex-1 overflow-y-auto p-6">
            {productsLoading && (
              <span className="font-mono text-sm text-muted">Loading products...</span>
            )}

            {!productsLoading && products.length === 0 && (
              <motion.div
                variants={slideUp}
                initial="hidden"
                animate="visible"
                className="border-[2.5px] border-black border-dashed p-16 text-center"
              >
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-display text-xl font-bold mb-2">No products yet</h3>
                <p className="font-body text-muted text-sm">
                  Add the first product to start voting.
                </p>
              </motion.div>
            )}

            {!productsLoading && products.length > 0 && (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    variants={slideUp}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white border-[2.5px] border-black shadow-brut hover:shadow-brut-lg cursor-pointer transition-shadow p-4"
                  >
                    <h3 className="font-display text-base font-bold mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="font-mono text-lg font-bold mb-3">
                      ₹{product.price?.toLocaleString()}
                    </p>
                    <div className="font-mono text-xs text-muted">
                      Added by @{product.addedBy?.username}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right panel — comments */}
        <div className="w-72 flex-shrink-0 border-l-[2.5px] border-black bg-white flex flex-col">
          <div className="p-4 border-b-[2.5px] border-black">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
              {selectedProduct ? `Comments — ${selectedProduct.title}` : 'Select a product'}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {!selectedProduct && (
              <span className="font-mono text-xs text-muted text-center px-4">
                Click a product to see comments
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          room={roomData}
          onClose={() => setShowInvite(false)}
          onRegenerated={handleInviteRegenerated}
        />
      )}

    </div>
  )
}