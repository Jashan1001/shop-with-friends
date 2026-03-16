export default function CommentInput({ value, onChange, onSubmit, loading }) {
  return (
    <form
      onSubmit={onSubmit}
      className="border-t-[2.5px] border-black p-3 flex gap-2 flex-shrink-0"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 border-[2.5px] border-black bg-white font-body text-sm px-3 py-2 outline-none focus:shadow-brut transition-shadow"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-4 py-2 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
      >
        {loading ? '...' : 'Send'}
      </button>
    </form>
  )
}
