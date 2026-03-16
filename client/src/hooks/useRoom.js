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

    socket.on('product:added', (product) => {
      queryClient.setQueryData(['products', roomId], (old) => {
        const exists = old?.some((p) => p._id === product._id)
        if (exists) return old
        return [product, ...(old || [])]
      })
      if (onNewProduct) onNewProduct(product._id)
    })

    socket.on('product:updated', (product) => {
      queryClient.setQueryData(['products', roomId], (old) =>
        old?.map((p) => (p._id === product._id ? { ...p, ...product } : p))
      )
    })

    socket.on('product:deleted', ({ productId }) => {
      queryClient.setQueryData(['products', roomId], (old) =>
        old?.filter((p) => p._id !== productId)
      )
    })

    socket.on('vote:updated', ({ productId, upvotes, downvotes }) => {
      queryClient.setQueryData(['products', roomId], (old) =>
        old?.map((p) =>
          p._id === productId ? { ...p, upvotes, downvotes } : p
        )
      )
    })

    socket.on('comment:added', (comment) => {
      queryClient.setQueryData(['comments', comment.productId], (old) => {
        const exists = old?.some((c) => c._id === comment._id)
        if (exists) return old
        return [...(old || []), comment]
      })
    })

    socket.on('comment:deleted', ({ commentId, productId }) => {
      queryClient.setQueryData(['comments', productId], (old) =>
        old?.filter((c) => c._id !== commentId)
      )
    })

    // NEW: update edited comment text in cache
    socket.on('comment:edited', ({ commentId, productId, text, edited }) => {
      queryClient.setQueryData(['comments', productId], (old) =>
        old?.map((c) =>
          c._id === commentId ? { ...c, text, edited } : c
        )
      )
    })

    socket.on('member:joined', () => {
      queryClient.invalidateQueries(['room', roomId])
    })

    socket.on('reaction:burst', ({ productId, reactions }) => {
      queryClient.setQueryData(['reactions', productId], reactions)
    })

    // NEW: update room name/emoji/description in cache
    socket.on('room:updated', ({ roomId: updatedRoomId, name, description, emoji }) => {
      queryClient.setQueryData(['room', updatedRoomId], (old) =>
        old ? { ...old, name, description, emoji } : old
      )
    })

    socket.on('room:deleted', ({ roomId: deletedRoomId }) => {
      if (deletedRoomId === roomId) {
        window.location.href = '/dashboard'
      }
    })

    socket.on('member:removed', ({ userId: removedUserId }) => {
      const currentUser = useAuthStore.getState().user
      const currentUserId = currentUser?.id || currentUser?._id
      if (removedUserId === currentUserId) {
        window.location.href = '/dashboard'
      }
    })

    return () => {
      socket.emit('leave:room', roomId)
      ;[
        'product:added', 'product:updated', 'product:deleted',
        'vote:updated', 'comment:added', 'comment:deleted', 'comment:edited',
        'member:joined', 'reaction:burst', 'room:updated',
        'room:deleted', 'member:removed',
      ].forEach((e) => socket.off(e))
    }
  }, [socket, roomId, onNewProduct])
}