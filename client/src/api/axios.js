import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
        const { login, logout } = useAuthStore.getState()

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
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