import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { LogoMark } from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.get('/student/profile/').then((r) => setProfile(r.data)).catch(() => {})
  }, [])

  const name = profile?.name || user?.name || 'Student'

  return (
    <div className="min-h-screen bg-[#0A0A14] pb-24 text-white">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-2">
          <LogoMark size={36} />
          <span className="font-[family-name:var(--font-syne)] font-semibold text-[#A594FF]">Proof</span>
          <span className="font-[family-name:var(--font-syne)] text-white/70">Folio</span>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
        >
          Log out
        </button>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6">
        <section className="rounded-2xl border border-[#644bdc26] bg-gradient-to-br from-indigo-950/40 to-black/40 p-6 shadow-lg">
          <div className="flex gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20 text-2xl font-bold text-indigo-200">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">{name}</h1>
              <p className="text-sm text-white/60">{profile?.college || user?.college}</p>
              <p className="text-sm text-white/60">
                {profile?.branch || user?.branch} · Class of {profile?.grad_year || user?.grad_year || '—'}
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-emerald-500/80" />
          </div>
          <p className="mt-2 text-xs text-white/50">Profile completion (demo bar)</p>
        </section>

        <section className="mt-6 grid gap-3">
          {['Profile setup', 'Academic records', 'Certifications', 'Achievements', 'Documents'].map(
            (label) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/90"
              >
                {label}
                <span className="ml-2 text-xs text-white/40">(screen wired in API — expand UI next)</span>
              </div>
            ),
          )}
        </section>
      </main>
    </div>
  )
}
