import { useState } from 'react'
import { api } from '../api/client'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark, Wordmark } from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const nav = useNavigate()
  const { loginWithTokens } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [branch, setBranch] = useState('CS')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register/', {
        name,
        email,
        password,
        branch,
      })
      const access = data?.tokens?.access
      if (access) await loginWithTokens(access)
      nav('/', { replace: true })
    } catch (err) {
      const d = err.response?.data
      setError(d?.email?.[0] || d?.detail || 'Registration failed')
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
      <div className="w-full max-w-md rounded-2xl border border-[#644bdc26] bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="mb-6 text-center font-[family-name:var(--font-syne)] text-xl font-semibold text-white">
          Student registration
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Full name</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Branch</label>
            <select
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              {['CS', 'EC', 'ME', 'Civil', 'EE', 'IT'].map((b) => (
                <option key={b} value={b} className="bg-[#0A0A14]">
                  {b}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{String(error)}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link className="text-indigo-400 hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
