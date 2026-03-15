import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import JoinRoomPage from './pages/JoinRoomPage'
import RoomPage from './pages/dashboard/RoomPage'
import { useSocket } from './hooks/useSocket'

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App