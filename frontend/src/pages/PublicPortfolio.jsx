import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { LogoMark } from '../components/Logo'

export default function PublicPortfolio() {
  const { studentId } = useParams()
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    api
      .get(`/portfolio/${studentId}/`)
      .then((r) => setData(r.data))
      .catch(() => setErr('Portfolio not found'))
  }, [studentId])

  if (err) {
    return <p className="p-8 text-center text-red-400">{err}</p>
  }
  if (!data) {
    return <p className="p-8 text-center text-white/60">Loading…</p>
  }

  const s = data.student

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#1A1830]">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <LogoMark size={32} />
          <span className="font-[family-name:var(--font-syne)] font-semibold text-[#A594FF]">Proof</span>
          <span className="font-[family-name:var(--font-syne)] text-[#1A1830]">Folio</span>
        </div>
        {data.verified_portfolio_badge && (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700">
            Verified Portfolio
          </span>
        )}
      </header>

      <section className="bg-[#1A1830] px-4 py-10 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <div className="h-28 w-28 rounded-full bg-indigo-500/30" />
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">{s.name}</h1>
          <p className="text-white/70">
            {s.college} · {s.branch} · {s.grad_year}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {s.linkedin_url && (
              <a
                href={s.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
              >
                LinkedIn
              </a>
            )}
            {s.github_url && (
              <a
                href={s.github_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
              >
                GitHub
              </a>
            )}
            {data.resume_url && (
              <a
                href={data.resume_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/30"
              >
                Download resume
              </a>
            )}
          </div>
          {s.last_updated && (
            <p className="text-xs text-white/50">Last updated: {new Date(s.last_updated).toLocaleDateString()}</p>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-[family-name:var(--font-syne)] text-xl font-semibold">Academic records</h2>
            <div className="grid gap-3">
              {data.academics?.map((sem) => (
                <div
                  key={sem.id}
                  className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
                >
                  <p className="font-medium">Semester {sem.semester_number}</p>
                  <p className="text-sm text-black/60">
                    CGPA {sem.cgpa ?? '—'} · {sem.percentage != null ? `${sem.percentage}%` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
        {data.hod && (
          <aside className="h-fit rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-black/50">Verification</p>
            <p className="mt-2 font-medium">{data.hod.name}</p>
            <p className="text-sm text-black/60">{data.hod.email}</p>
            <p className="mt-2 text-sm text-black/60">
              {data.hod.verified_cert_count} certifications · {data.hod.verified_achievement_count} achievements
              verified
            </p>
          </aside>
        )}
      </div>

      <footer className="border-t border-black/5 py-6 text-center text-sm text-black/40">
        Powered by ProofFolio
      </footer>
    </div>
  )
}
