import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VoteButtons from '../components/products/VoteButtons'

// Mock the API calls
vi.mock('../api/votes.api', () => ({
  vote: vi.fn().mockResolvedValue({}),
  removeVote: vi.fn().mockResolvedValue({}),
}))

const makeProduct = (overrides = {}) => ({
  _id: 'prod123',
  upvotes: 3,
  downvotes: 1,
  userVote: null,
  roomId: 'room123',
  ...overrides,
})

describe('VoteButtons', () => {
  let onVoteUpdate

  beforeEach(() => {
    onVoteUpdate = vi.fn()
  })

  it('renders upvote and downvote counts', () => {
    render(<VoteButtons product={makeProduct()} onVoteUpdate={onVoteUpdate} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('calls onVoteUpdate optimistically when upvoting', async () => {
    render(<VoteButtons product={makeProduct()} onVoteUpdate={onVoteUpdate} />)

    fireEvent.click(screen.getAllByRole('button')[0]) // upvote button

    await waitFor(() => {
      expect(onVoteUpdate).toHaveBeenCalledWith('prod123', {
        upvotes: 4,
        downvotes: 1,
        userVote: 1,
      })
    })
  })

  it('removes upvote when clicking the same button again', async () => {
    // Start with userVote: 1 (already upvoted)
    render(
      <VoteButtons
        product={makeProduct({ userVote: 1, upvotes: 4 })}
        onVoteUpdate={onVoteUpdate}
      />
    )

    fireEvent.click(screen.getAllByRole('button')[0])

    await waitFor(() => {
      expect(onVoteUpdate).toHaveBeenCalledWith('prod123', {
        upvotes: 3,
        downvotes: 1,
        userVote: null,
      })
    })
  })

  it('switches from downvote to upvote correctly', async () => {
    render(
      <VoteButtons
        product={makeProduct({ userVote: -1, upvotes: 3, downvotes: 2 })}
        onVoteUpdate={onVoteUpdate}
      />
    )

    fireEvent.click(screen.getAllByRole('button')[0]) // click upvote

    await waitFor(() => {
      expect(onVoteUpdate).toHaveBeenCalledWith('prod123', {
        upvotes: 4,
        downvotes: 1,
        userVote: 1,
      })
    })
  })

  it('highlights the active vote button', () => {
    render(
      <VoteButtons
        product={makeProduct({ userVote: 1 })}
        onVoteUpdate={onVoteUpdate}
      />
    )
    const upvoteBtn = screen.getAllByRole('button')[0]
    expect(upvoteBtn.className).toContain('bg-lime')
  })
})
