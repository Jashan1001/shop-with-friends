import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocketStore } from '../store/socketStore'

export const useRoom = (roomId) => {
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

    // Vote updated
    socket.on('vote:updated', ({ productId, upvotes, downvotes }) => {
      queryClient.setQueryData(['products', roomId], (old) =>
        old?.map((p) =>
          p._id === productId ? { ...p, upvotes, downvotes } : p
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

    return () => {
      socket.emit('leave:room', roomId)
      ;['product:added', 'product:updated', 'product:deleted',
        'vote:updated', 'comment:added', 'comment:deleted', 'member:joined'
      ].forEach((e) => socket.off(e))
    }
  }, [socket, roomId])
}