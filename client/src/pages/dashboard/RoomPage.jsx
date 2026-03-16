import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, UserPlus, Plus, Users, Settings, Trash2, LogOut, MoreVertical, Package, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRoom, deleteRoom, leaveRoom, updateRoom, removeMember } from '../../api/rooms.api'
import { getProducts } from '../../api/products.api'
import { useAuthStore } from '../../store/authStore'
import InviteModal from '../../components/rooms/InviteModal'
import ProductCard from '../../components/products/ProductCard'
import AddProductModal from '../../components/products/AddProductModal'
import CommentPanel from '../../components/comments/CommentPanel'
import Avatar from '../../components/ui/Avatar'
import { stagger, slideUp } from '../../animations/variants'
import { useRoom } from '../../hooks/useRoom'
import { ProductCardSkeleton } from '../../components/ui/Skeleton'
import ProductFeed from '../../components/products/ProductFeed'
import { getRoomIconOption } from '../../utils/roomIcons'

// Mobile tab options
const MOBILE_TABS = ['Products', 'Comments', 'Members']

export default function RoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [showInvite, setShowInvite] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [newProductIds, setNewProductIds] = useState(new Set())
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  // Mobile: which tab is active
  const [mobileTab, setMobileTab] = useState('Products')
  // Mobile: comments drawer open
  const [showCommentDrawer, setShowCommentDrawer] = useState(false)

  const handleNewProduct = useCallback((productId) => {
    setNewProductIds((prev) => new Set([...prev, productId]))
    setTimeout(() => {
      setNewProductIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }, 2000)
  }, [])

  useRoom(roomId, handleNewProduct)

  const { data: roomData, isLoading: roomLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoom(roomId).then((res) => res.data.room),
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', roomId],
    queryFn: () => getProducts(roomId).then((res) => res.data.products),
    enabled: !!roomId,
  })

  const currentUserId = user?.id || user?._id
  const createdById = roomData?.createdBy?._id || roomData?.createdBy
  const isOwner = String(createdById || '') === String(currentUserId || '')
  const RoomIcon = roomData ? getRoomIconOption(roomData.emoji).icon : Package

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'top') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const handleInviteRegenerated = (newCode) => {
    queryClient.setQueryData(['room', roomId], (old) => ({ ...old, inviteCode: newCode }))
  }

  const handleVoteUpdate = (productId, voteData) => {
    queryClient.setQueryData(['products', roomId], (old) =>
      old?.map((p) => p._id === productId ? { ...p, ...voteData } : p)
    )
  }

  const handleDeleteRoom = async () => {
    if (!window.confirm('Delete this room? This cannot be undone.')) return
    try {
      await deleteRoom(roomId)
      toast.success('Room deleted')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to delete room')
    }
  }

  const handleLeaveRoom = async () => {
    if (!window.confirm('Leave this room?')) return
    try {
      await leaveRoom(roomId)
      toast.success('Left room')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to leave room')
    }
  }

  const handleProductDeleted = (productId) => {
    queryClient.setQueryData(['products', roomId], (old) =>
      old?.filter((p) => p._id !== productId)
    )
    if (selectedProduct?._id === productId) setSelectedProduct(null)
  }

  const handleStatusUpdate = (updatedProduct) => {
    queryClient.setQueryData(['products', roomId], (old) =>
      old?.map((p) => (p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p))
    )
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    // On mobile, open the comment drawer
    setShowCommentDrawer(true)
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

  // ─── Shared sub-components ─────────────────────────────────────
  // ProductFeed is a standalone component — passes all needed props
  const productFeedProps = {
    products: sortedProducts,
    isLoading: productsLoading,
    isOwner,
    newProductIds,
    onProductClick: handleProductClick,
    onVoteUpdate: handleVoteUpdate,
    onDelete: handleProductDeleted,
    onStatusUpdate: handleStatusUpdate,
  }

  const MembersList = (
    <div className="p-4 space-y-1">
      {roomData.members.map((member) => (
        <div key={member._id} className="flex items-center gap-2.5 py-2 group">
          <Avatar name={member.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="font-body text-sm truncate">{member.name}</div>
            <div className="font-mono text-[10px] text-muted truncate">@{member.username}</div>
          </div>
          <div className="flex items-center gap-1">
            {member._id === (roomData.createdBy?._id || roomData.createdBy) && (
              <span className="font-mono text-[8px] bg-purple text-white px-1.5 py-0.5">OWN</span>
            )}
            {isOwner && member._id !== currentUserId && (
              <button
                onClick={async () => {
                  if (!window.confirm(`Remove @${member.username}?`)) return
                  try {
                    await removeMember(roomId, member._id)
                    queryClient.invalidateQueries(['room', roomId])
                    toast.success(`Removed @${member.username}`)
                  } catch {
                    toast.error('Failed to remove member')
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-coral transition-all"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* ─── Top navbar ─── */}
      <div className="border-b-[2.5px] border-black bg-white px-4 lg:px-6 py-3 flex items-center gap-3 flex-shrink-0 sticky top-0 z-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 font-body text-sm border-[2.5px] border-black px-3 py-1.5 shadow-brut hover:shadow-brut-lg transition-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 flex-shrink-0"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-9 h-9 bg-yellow border-[2.5px] border-black flex items-center justify-center flex-shrink-0">
            <RoomIcon size={16} className="text-black" />
          </div>
          <h1 className="font-display text-lg font-bold truncate">{roomData.name}</h1>
          {isOwner && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-purple text-white border-[2px] border-black px-2 py-0.5 flex-shrink-0 hidden sm:inline">
              Owner
            </span>
          )}
        </div>

        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-3 py-1.5 shadow-brut hover:shadow-brut-lg transition-shadow flex-shrink-0"
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">Invite</span>
        </button>

        {/* Settings menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 flex items-center justify-center border-[2.5px] border-black hover:bg-cream transition-colors shadow-brut"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-11 z-20 bg-white border-[2.5px] border-black shadow-brut-lg min-w-48">
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        const newName = window.prompt('New room name:', roomData.name)
                        if (newName?.trim()) {
                          updateRoom(roomId, { name: newName.trim() })
                            .then((res) => {
                              queryClient.setQueryData(['room', roomId], (old) => ({ ...old, name: res.data.room.name }))
                              toast.success('Room renamed')
                            })
                            .catch(() => toast.error('Failed to rename room'))
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm hover:bg-cream transition-colors border-b-[2px] border-black/10 text-left"
                    >
                      <Settings size={14} /> Rename Room
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); handleDeleteRoom() }}
                      className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm hover:bg-coral hover:text-white transition-colors text-coral text-left"
                    >
                      <Trash2 size={14} /> Delete Room
                    </button>
                  </>
                )}
                {!isOwner && (
                  <button
                    onClick={() => { setShowMenu(false); handleLeaveRoom() }}
                    className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm hover:bg-coral hover:text-white transition-colors text-coral text-left"
                  >
                    <LogOut size={14} /> Leave Room
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── DESKTOP: 3-zone layout ─── */}
      <div className="hidden lg:flex flex-1 overflow-hidden">

        {/* Left sidebar — members */}
        <div className="w-56 flex-shrink-0 border-r-[2.5px] border-black bg-black flex flex-col">
          <div className="p-4 border-b-[2px] border-white/10">
            <div className="flex items-center gap-2">
              <Users size={13} className="text-white/40" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                Members ({roomData.members.length})
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {roomData.members.map((member) => (
              <div key={member._id} className="flex items-center gap-2 py-2 group">
                <div className="w-6 h-6 bg-yellow border-[2px] border-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-[9px] font-bold text-black">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-body text-xs text-white truncate">{member.name}</div>
                  <div className="font-mono text-[10px] text-white/40 truncate">@{member.username}</div>
                </div>
                <div className="flex items-center gap-1">
                  {member._id === (roomData.createdBy?._id || roomData.createdBy) && (
                    <span className="font-mono text-[8px] bg-purple text-white px-1">OWN</span>
                  )}
                  {isOwner && member._id !== currentUserId && (
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Remove @${member.username}?`)) return
                        try {
                          await removeMember(roomId, member._id)
                          queryClient.invalidateQueries(['room', roomId])
                          toast.success(`Removed @${member.username}`)
                        } catch {
                          toast.error('Failed to remove member')
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-coral transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
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
              <Plus size={14} /> Add Product
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <ProductFeed {...productFeedProps} />
          </div>
        </div>

        {/* Right panel — comments */}
        <div className="w-72 flex-shrink-0 border-l-[2.5px] border-black bg-white flex flex-col">
          <div className="p-4 border-b-[2.5px] border-black flex-shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted truncate block">
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

      {/* ─── MOBILE: tab layout ─── */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">

        {/* Mobile tab bar */}
        <div className="border-b-[2.5px] border-black bg-white flex-shrink-0">
          <div className="flex">
            {MOBILE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={`flex-1 py-3 font-mono text-xs uppercase tracking-widest transition-colors
                  ${mobileTab === tab ? 'bg-yellow font-bold border-b-[2.5px] border-black' : 'hover:bg-cream'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Add product button (mobile) */}
        {mobileTab === 'Products' && (
          <div className="px-4 py-3 border-b-[2.5px] border-black bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex gap-0">
              {['newest', 'top'].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border-[2px] border-black transition-colors
                    ${sortBy === sort ? 'bg-yellow font-bold' : 'bg-white hover:bg-cream'}`}
                >
                  {sort === 'newest' ? 'New' : 'Top'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-1.5 bg-black text-white border-[2.5px] border-black font-body font-semibold text-sm px-3 py-1.5"
            >
              <Plus size={13} /> Add
            </button>
          </div>
        )}

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {mobileTab === 'Products' && (
            <div className="p-4"><ProductFeed {...productFeedProps} /></div>
          )}
          {mobileTab === 'Comments' && (
            <div className="flex flex-col h-full">
              {selectedProduct ? (
                <>
                  <div className="px-4 py-2 border-b-[2px] border-black/10 bg-cream">
                    <span className="font-mono text-[10px] text-muted truncate block">
                      {selectedProduct.title}
                    </span>
                  </div>
                  <div className="flex-1">
                    <CommentPanel product={selectedProduct} />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <div>
                    <MessageSquare size={32} className="text-muted mx-auto mb-3" />
                    <p className="font-mono text-xs text-muted">
                      Go to Products tab and tap a product to see its comments
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          {mobileTab === 'Members' && MembersList}
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
