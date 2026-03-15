import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, UserPlus, Plus, Users } from 'lucide-react'
import { getRoom } from '../../api/rooms.api'
import { getProducts } from '../../api/products.api'
import { useAuthStore } from '../../store/authStore'
import InviteModal from '../../components/rooms/InviteModal'
import ProductCard from '../../components/products/ProductCard'
import AddProductModal from '../../components/products/AddProductModal'
import CommentPanel from '../../components/comments/CommentPanel'
import { stagger, slideUp } from '../../animations/variants'
import { useRoom } from '../../hooks/useRoom'
import { ProductCardSkeleton } from '../../components/ui/Skeleton'

export default function RoomPage() {
  const { roomId } = useParams()
  useRoom(roomId)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [showInvite, setShowInvite] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  const { data: roomData, isLoading: roomLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoom(roomId).then((res) => res.data.room),
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', roomId],
    queryFn: () => getProducts(roomId).then((res) => res.data.products),
    enabled: !!roomId,
  })

  const isOwner = roomData?.createdBy?._id === user?.id

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'top') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const handleInviteRegenerated = (newCode) => {
    queryClient.setQueryData(['room', roomId], (old) => ({ ...old, inviteCode: newCode }))
  }

  const handleVoteUpdate = (productId, voteData) => {
    queryClient.setQueryData(['products', roomId], (old) =>
      old.map((p) =>
        p._id === productId
          ? { ...p, upvotes: voteData.upvotes, downvotes: voteData.downvotes, userVote: voteData.userVote }
          : p
      )
    )
  }

  if (roomLoading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <span className="font-mono text-sm text-muted">Loading room...</span>
    </div>
  )

  if (!roomData) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <span className="font-mono text-sm text-coral">Room not found.</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Navbar */}
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

      {/* 3-zone layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
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
                <div className="w-7 h-7 bg-yellow border-[2px] border-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-[10px] font-bold text-black">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-body text-xs text-white truncate">{member.name}</div>
                  <div className="font-mono text-[10px] text-white/40 truncate">@{member.username}</div>
                </div>
                {member._id === roomData.createdBy._id && (
                  <span className="font-mono text-[8px] bg-purple text-white px-1 ml-auto flex-shrink-0">OWN</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main feed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b-[2.5px] border-black bg-white px-6 py-3 flex items-center justify-between flex-shrink-0">
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
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 bg-black text-white border-[2.5px] border-black font-body font-semibold text-sm px-4 py-1.5 shadow-brut hover:shadow-brut-lg transition-shadow"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {productsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}
            {!productsLoading && sortedProducts.length === 0 && (
              <motion.div
                variants={slideUp}
                initial="hidden"
                animate="visible"
                className="border-[2.5px] border-black border-dashed p-16 text-center"
              >
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-display text-xl font-bold mb-2">No products yet</h3>
                <p className="font-body text-muted text-sm">Add the first product to start voting.</p>
              </motion.div>
            )}
            {!productsLoading && sortedProducts.length > 0 && (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={setSelectedProduct}
                    onVoteUpdate={handleVoteUpdate}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right panel — comments */}
        <div className="w-72 flex-shrink-0 border-l-[2.5px] border-black bg-white flex flex-col">
          <div className="p-4 border-b-[2.5px] border-black flex-shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
              {selectedProduct ? selectedProduct.title : 'Select a product'}
            </span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedProduct
              ? <CommentPanel product={selectedProduct} />
              : (
                <div className="flex-1 flex items-center justify-center">
                  <span className="font-mono text-xs text-muted text-center px-4">
                    Click a product to see comments
                  </span>
                </div>
              )
            }
          </div>
        </div>

      </div>

      {/* Modals */}
      {showInvite && (
        <InviteModal
          room={roomData}
          onClose={() => setShowInvite(false)}
          onRegenerated={handleInviteRegenerated}
        />
      )}
      {showAddProduct && (
        <AddProductModal
          roomId={roomId}
          onClose={() => setShowAddProduct(false)}
          onAdded={() => {}}
        />
      )}

    </div>
  )
}