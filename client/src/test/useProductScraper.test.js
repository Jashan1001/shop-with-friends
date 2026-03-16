import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProductScraper } from '../hooks/useProductScraper'

// Mock the axios instance
vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '../api/axios'

describe('useProductScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading: false and no error initially', () => {
    const { result } = renderHook(() => useProductScraper())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('returns scraped data on success', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        title: 'Sony WH-1000XM5',
        price: 24990,
        platform: 'amazon',
        image: 'https://example.com/img.jpg',
        error: null,
      },
    })

    const { result } = renderHook(() => useProductScraper())

    let data
    await act(async () => {
      data = await result.current.scrape('https://amazon.in/product')
    })

    expect(data.title).toBe('Sony WH-1000XM5')
    expect(data.price).toBe(24990)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('sets error and returns null on API failure', async () => {
    api.post.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useProductScraper())

    let data
    await act(async () => {
      data = await result.current.scrape('https://amazon.in/product')
    })

    expect(data).toBeNull()
    expect(result.current.error).toBe('Could not fetch page — fill in manually.')
    expect(result.current.loading).toBe(false)
  })

  it('returns null and does nothing for empty URL', async () => {
    const { result } = renderHook(() => useProductScraper())

    let data
    await act(async () => {
      data = await result.current.scrape('')
    })

    expect(data).toBeNull()
    expect(api.post).not.toHaveBeenCalled()
  })
})
