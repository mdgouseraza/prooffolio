import { Navigate, Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AdminDashboard from './pages/AdminDashboard'
import HodDashboard from './pages/HodDashboard'
import Login from './pages/Login'
import PublicPortfolio from './pages/PublicPortfolio'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'

function GoogleCallback() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const code = params.get('code')
  const { loginWithTokens } = useAuth()

  useEffect(() => {
    if (code) {
      api.post('/auth/google/', { token: code })
        .then(({ data }) => {
          loginWithTokens(data.tokens.access)
          window.location.href = '/app'
        })
        .catch(() => {
          window.location.href = '/login?error=google_auth_failed'
        })
    }
  }, [code, loginWithTokens])

  if (!code) {
    return <Navigate to="/login?error=no_code" replace />
  }

  return <div className="flex min-h-screen items-center justify-center text-white/60">Processing Google login…</div>
}

function RoleHome() {
  const { user, loading } = useAuth()
  console.log('RoleHome:', { user, loading })
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-white/60">Loading…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'hod') return <Navigate to="/hod" replace />
  return <Navigate to="/app" replace />
}

function Protected({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-white/60">Loading…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/portfolio/:studentId" element={<PublicPortfolio />} />
      <Route path="/" element={<RoleHome />} />
      <Route
        path="/auth/google/callback"
        element={<GoogleCallback />}
      />
      <Route
        path="/app"
        element={
          <Protected roles={['student']}>
            <StudentDashboard />
          </Protected>
        }
      />
      <Route
        path="/hod"
        element={
          <Protected roles={['hod']}>
            <HodDashboard />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected roles={['admin']}>
            <AdminDashboard />
          </Protected>
        }
      />
    </Routes>
  )
}
