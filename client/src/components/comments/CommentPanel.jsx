import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getComments, addComment, deleteComment } from '../../api/comments.api'
import CommentList from './CommentList'
import CommentInput from './CommentInput'

export default function CommentPanel({ product }) {
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
      await addComment(product._id, text.trim())
      setText('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(product._id, commentId)
      queryClient.setQueryData(['comments', product._id], (old) =>
        old.filter((c) => c._id !== commentId)
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <CommentList
          comments={comments}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
      </div>
      <CommentInput
        value={text}
        onChange={setText}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}
