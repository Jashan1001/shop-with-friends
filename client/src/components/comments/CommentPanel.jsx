import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { getComments, addComment, deleteComment } from '../../api/comments.api'
import { useAuthStore } from '../../store/authStore'
import timeAgo from '../../utils/timeAgo'

export default function CommentPanel({ product }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', product._id],
    queryFn: () => getComments(product._id).then((res) => res.data.comments),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const res = await addComment(product._id, text.trim())
      queryClient.setQueryData(['comments', product._id], (old) => [
        ...(old || []),
        res.data.comment,
      ])
      setText('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId)
      queryClient.setQueryData(['comments', product._id], (old) =>
        old.filter((c) => c._id !== commentId)
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <span className="font-mono text-xs text-muted">Loading...</span>
        )}
        {!isLoading && comments.length === 0 && (
          <span className="font-mono text-xs text-muted">
            No comments yet. Be the first.
          </span>
        )}
        {comments.map((comment) => (
          <div key={comment._id} className="border-[2px] border-black p-3 bg-cream">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] font-bold">
                @{comment.userId?.username}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted">
                  {timeAgo(comment.createdAt)}
                </span>
                {comment.userId?._id === user?.id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-muted hover:text-coral transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed">{comment.text}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t-[2.5px] border-black p-3 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border-[2.5px] border-black bg-white font-body text-sm px-3 py-2 outline-none focus:shadow-brut transition-shadow"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-4 py-2 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>

    </div>
  )
}