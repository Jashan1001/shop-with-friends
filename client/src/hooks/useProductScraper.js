import { useState, useCallback } from 'react'
import api from '../api/axios'

export function useProductScraper() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const scrape = useCallback(async (url) => {
    if (!url?.trim()) return null
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/products/scrape', { url: url.trim() })
      return res.data  // { title, image, description, price, platform, error? }
    } catch (err) {
      setError('Could not fetch page — fill in manually.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { scrape, loading, error }
}
