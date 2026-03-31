import { useState } from 'react'
import { api } from '../api/client'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark, Wordmark } from '../components/Logo'
import { setAccessToken } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const nav = useNavigate()
  const { loginWithTokens } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = () => {
    window.location.href = `https://accounts.google.com/oauth/authorize?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&response_type=code&scope=email%20profile&access_type=offline`
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post(
        '/auth/token/',
        { 
          username:email,
          password, 
        })
      if (data?.access) {
        if (data?.refresh) {
          localStorage.setItem('refresh', data.refresh)
        }
        await loginWithTokens(data.access)
        nav('/', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A14] px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <LogoMark size={56} />
        <Wordmark />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-[#644bdc26] bg-white/5 p-8 shadow-[0_0_60px_-20px_rgba(79,70,229,0.5)] backdrop-blur-xl">
        <h1 className="mb-6 text-center font-[family-name:var(--font-syne)] text-xl font-semibold text-white">
          Sign in
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Email</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Password</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{String(error)}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="px-4 text-xs text-white/40">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white hover:bg-white/20 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-6.19-2.41-6.19-5.38 0-1.23.05-2.41 0-1.23zm-1.48 0-1.23-.05-2.41-.05-1.23v.01c0 1.41.28.69 2.41 1.23.01 1.41 0 .28.69 2.41 1.23.01 1.41-.28.69-2.41-1.23-.01-1.41zm-1.48 0c-.82 0-1.48-.05-1.48-.05-1.48v.01c0 1.48.55 1.48 1.48.01 1.48.55 1.48 1.48.01 1.48-.55-1.48-.01-1.48zm0 9.5c0 1.19 0 2.34-.26 2.34-2.34 0-1.78-.78-1.78-1.78v.01c0 1.78.55 1.78 1.78.01 1.78.55 1.78 1.78.01 1.78-.55-1.78-.01-1.78zm0 9.5c0 1.19 0 2.34-.26 2.34-2.34 0-1.78-.78-1.78-1.78v.01c0 1.78.55 1.78 1.78.01 1.78.55 1.78 1.78.01 1.78-.55-1.78-.01-1.78z" fill="#4285F4"/>
          </svg>
          <span className="text-sm">Continue with Google</span>
        </button>
        <p className="mt-6 text-center text-sm text-white/50">
          No account?{' '}
          <Link className="text-indigo-400 hover:underline" to="/register">
            Register as student
          </Link>
        </p>
      </div>
    </div>
  )
}
