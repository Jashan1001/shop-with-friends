import { Trash2 } from 'lucide-react'
import DOMPurify from 'dompurify'
import { useAuthStore } from '../../store/authStore'
import timeAgo from '../../utils/timeAgo'

export default function CommentList({ comments = [], isLoading, onDelete }) {
  const { user } = useAuthStore()

  if (isLoading) {
    return <span className="font-mono text-xs text-muted">Loading...</span>
  }

  if (comments.length === 0) {
    return (
      <span className="font-mono text-xs text-muted">
        No comments yet. Be the first.
      </span>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const safeUsername = DOMPurify.sanitize(comment.userId?.username || '')
        const safeText = DOMPurify.sanitize(comment.text || '')
        return (
          <div key={comment._id} className="border-[2px] border-black p-3 bg-cream">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] font-bold">@{safeUsername}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted">
                  {timeAgo(comment.createdAt)}
                </span>
                {comment.userId?._id === user?.id && (
                  <button
                    onClick={() => onDelete(comment._id)}
                    className="text-muted hover:text-coral transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
            <p
              className="font-body text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: safeText }}
            />
          </div>
        )
      })}
    </div>
  )
}
