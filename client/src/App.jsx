import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import JoinRoomPage from './pages/JoinRoomPage'
import RoomPage from './pages/dashboard/RoomPage'
import LandingPage from './pages/LandingPage'
import { useSocket } from './hooks/useSocket'
import ProfilePage from './pages/ProfilePage'

// Protected route — redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { accessToken } = useAuthStore()
  return accessToken ? children : <Navigate to="/login" replace />
}

function App() {
  useSocket()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/join/:code" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
        <Route
          path="/room/:roomId"
          element={<ProtectedRoute><RoomPage /></ProtectedRoute>}
        />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        {/* 404 catch-all — must be last */}
        <Route path="*" element={
          <div className="min-h-screen bg-cream flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-black border-[2.5px] border-black shadow-brut-xl mx-auto flex items-center justify-center mb-6">
                <span className="font-display text-2xl font-black text-yellow">404</span>
              </div>
              <h1 className="font-display text-5xl font-black mb-3">Page not found.</h1>
              <p className="font-mono text-sm text-muted mb-8">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-8 py-3 shadow-brut hover:shadow-brut-lg transition-shadow inline-block">
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App