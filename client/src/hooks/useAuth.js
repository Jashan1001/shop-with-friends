import { useAuthStore } from '../store/authStore'

/**
 * Convenience hook — wraps authStore and exposes derived state.
 * Use this instead of importing useAuthStore directly in components.
 */
export function useAuth() {
  const { user, accessToken, login, logout, updateUser } = useAuthStore()

  return {
    user,
    isLoggedIn: !!accessToken,
    login,
    logout,
    updateUser,
  }
}
