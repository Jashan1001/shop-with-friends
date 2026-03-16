import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocketStore } from '../store/socketStore'
import { useAuthStore } from '../store/authStore'

export const useRoom = (roomId, onNewProduct) => {
  const socket = useSocketStore((s) => s.socket)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket || !roomId) return

    socket.emit('join:room', roomId)

    // New product added by someone else
    socket.on('product:added', (product) => {
      queryClient.setQueryData(['products', roomId], (old) => {
        const exists = old?.some((p) => p._id === product._id)
        if (exists) return old
        return [product, ...(old || [])]
      })

      // Trigger pulse on newly added cards.
      if (onNewProduct) onNewProduct(product._id)
    })

    // Product updated (status change etc)
    socket.on('product:updated', (product) => {
      queryClient.setQueryData(['products', roomId], (old) =>
        old?.map((p) => (p._id === product._id ? { ...p, ...product } : p))
      )
    })

    // Product deleted
    socket.on('product:deleted', ({ productId }) => {
      queryClient.setQueryData(['products', roomId], (old) =>
        old?.filter((p) => p._id !== productId)
      )
    })

    // Vote updated — preserve existing userVote from cache (server doesn't send per-user vote)
    socket.on('vote:updated', ({ productId, upvotes, downvotes }) => {
      queryClient.setQueryData(['products', roomId], (old) =>
        old?.map((p) =>
          p._id === productId ? { ...p, upvotes, downvotes } : p
          // Note: intentionally NOT overwriting p.userVote here
          // The optimistic update in VoteButtons.jsx sets the correct userVote
        )
      )
    })

    // Comment added
    socket.on('comment:added', (comment) => {
      queryClient.setQueryData(['comments', comment.productId], (old) => {
        const exists = old?.some((c) => c._id === comment._id)
        if (exists) return old
        return [...(old || []), comment]
      })
    })

    // Comment deleted
    socket.on('comment:deleted', ({ commentId, productId }) => {
      queryClient.setQueryData(['comments', productId], (old) =>
        old?.filter((c) => c._id !== commentId)
      )
    })

    // Member joined
    socket.on('member:joined', () => {
      queryClient.invalidateQueries(['room', roomId])
    })

    // Reaction burst — update reaction cache for the affected product
    socket.on('reaction:burst', ({ productId, reactions }) => {
      queryClient.setQueryData(['reactions', productId], reactions)
    })

    socket.on('room:deleted', ({ roomId: deletedRoomId }) => {
      // Only redirect if THIS room was deleted, not another room the user belongs to
      if (deletedRoomId === roomId) {
        window.location.href = '/dashboard'
      }
    })

    socket.on('member:removed', ({ userId: removedUserId }) => {
      // Only redirect the user who was actually removed — not everyone in the room
      const currentUser = useAuthStore.getState().user
      const currentUserId = currentUser?.id || currentUser?._id
      if (removedUserId === currentUserId) {
        window.location.href = '/dashboard'
      }
    })

    return () => {
      socket.emit('leave:room', roomId)
      ;['product:added', 'product:updated', 'product:deleted',
        'vote:updated', 'comment:added', 'comment:deleted',
        'member:joined', 'reaction:burst', 'room:deleted', 'member:removed'
      ].forEach((e) => socket.off(e))
    }
  }, [socket, roomId, onNewProduct])
}