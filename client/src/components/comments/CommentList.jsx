import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import timeAgo from '../../utils/timeAgo'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function CommentList({ comments = [], productId, roomOwnerId, onDeleted }) {
  const { user } = useAuthStore()
  const [editingId, setEditingId]   = useState(null)
  const [editText, setEditText]     = useState('')
  const [savingId, setSavingId]     = useState(null)

  const startEdit = (comment) => {
    setEditingId(comment._id)
    setEditText(comment.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = async (comment) => {
    if (!editText.trim()) return
    setSavingId(comment._id)
    try {
      await api.put(`/products/${productId}/comments/${comment._id}`, {
        text: editText.trim(),
      })
      // Socket will update cache via comment:edited event
      cancelEdit()
      toast.success('Comment updated')
    } catch {
      toast.error('Failed to update comment')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/products/${productId}/comments/${commentId}`)
      onDeleted?.(commentId)
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  if (!comments.length) {
    return (
      <p className="font-mono text-xs text-muted text-center py-6">
        No comments yet. Be the first.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {comments.map((comment) => {
          const isOwner     = comment.userId?._id === user?.id || comment.userId?._id === user?._id
          const isRoomOwner = roomOwnerId && (roomOwnerId === user?.id || roomOwnerId === user?._id)
          const isEditing   = editingId === comment._id

          return (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-cream border-[2px] border-black p-3 group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-bold">
                  @{comment.userId?.username}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-muted">
                    {timeAgo(comment.createdAt)}
                    {comment.edited && (
                      <span className="ml-1 text-muted/60">(edited)</span>
                    )}
                  </span>
                  {/* Edit button — only comment owner */}
                  {isOwner && !isEditing && (
                    <button
                      onClick={() => startEdit(comment)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 hover:bg-black/10"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                  {/* Delete button — comment owner OR room owner */}
                  {(isOwner || isRoomOwner) && !isEditing && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-coral hover:text-white"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="mt-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full border-[2px] border-black bg-white font-body text-sm px-2 py-1.5 outline-none focus:shadow-brut resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-1.5 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="font-mono text-[11px] flex items-center gap-1 px-2 py-1 border-[2px] border-black hover:bg-black/10"
                    >
                      <X size={11} /> Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(comment)}
                      disabled={!!savingId}
                      className="font-mono text-[11px] flex items-center gap-1 px-2 py-1 border-[2px] border-black bg-lime hover:shadow-brut transition-shadow disabled:opacity-50"
                    >
                      <Check size={11} /> {savingId ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-body text-sm leading-relaxed">{comment.text}</p>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}