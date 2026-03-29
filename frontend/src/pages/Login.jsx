import { useState } from 'react'
import axios from 'axios'
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

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(
        '/api/auth/token/',
        { email, password },
        { withCredentials: true, baseURL: '' },
      )
      if (data?.access) {
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
