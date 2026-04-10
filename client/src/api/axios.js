import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const normalizeApiUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl

  let normalized = rawUrl.trim().replace(/\/$/, '')

  // Misconfigured values like https://host/socket.io cause broken API routes.
  normalized = normalized.replace(/\/socket\.io$/i, '')

  // Ensure API base path exists even if env only contains host URL.
  if (!/\/api\/v\d+$/i.test(normalized)) {
    normalized = `${normalized}/api/v1`
  }

  return normalized
}

// Guard: catch the most common deployment mistake — localhost URL in production
const apiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL)
if (!apiUrl) {
  console.error(
    '[CartCrew] VITE_API_URL is not set.\n' +
    'In Vercel: Project Settings → Environment Variables → add VITE_API_URL'
  )
}
if (import.meta.env.PROD && apiUrl?.includes('localhost')) {
  console.error(
    '[CartCrew] VITE_API_URL is pointing to localhost in a production build.\n' +
    'Set VITE_API_URL to your Railway URL in Vercel environment variables.\n' +
    'Current value: ' + apiUrl
  )
}

const api = axios.create({
  baseURL: apiUrl,
})

// Request interceptor — attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle expired tokens automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const { refreshToken } = useAuthStore.getState()

    // Only attempt refresh if:
    // 1. It's a 401
    // 2. We haven't already retried this request
    // 3. We actually have a refresh token (i.e. user was logged in)
    // Without check #3, a failed login 401 would trigger a refresh with null,
    // silently swallowing the error and redirecting instead of showing it.
    if (error.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true

      try {
        const { login } = useAuthStore.getState()

        const { data } = await axios.post(
          `${apiUrl}/auth/refresh`,
          { refreshToken }
        )

        // Update store with new tokens
        login(useAuthStore.getState().user, data.accessToken, data.refreshToken)

        // Retry the original request with new token
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        // Refresh failed — log user out
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api