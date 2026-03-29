import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { LogoMark } from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export default function HodDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/hod/stats/').then((r) => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#1A1830]">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <LogoMark size={36} />
          <span className="font-[family-name:var(--font-syne)] font-semibold">HOD panel</span>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
        >
          Log out
        </button>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-black/60">Signed in as {user?.email}</p>
        {stats && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="text-sm text-black/50">Students in branch</p>
              <p className="text-2xl font-semibold">{stats.total_students}</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="text-sm text-black/50">Pending verifications</p>
              <p className="text-2xl font-semibold">{stats.pending_verifications}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
