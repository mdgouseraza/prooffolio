import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { LogoMark } from '../components/Logo'
import { useAuth } from '../context/AuthContext'

function AcademicRecordsSection() {
  const [records, setRecords] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({
    semester_number: '',
    cgpa: '',
    percentage: '',
    subjects_json: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/student/academics/').then((r) => setRecords(r.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/student/academics/', formData)
      setRecords([...records, data])
      setAdding(false)
      setFormData({ semester_number: '', cgpa: '', percentage: '', subjects_json: [] })
    } catch (err) {
      console.error('Failed to add academic record:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      submitted: '📤 Submitted',
      seen: '👁️ Seen', 
      approved: '✅ Approved',
      rejected: '❌ Rejected'
    }
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${
        status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
        status === 'rejected' ? 'bg-red-500/20 text-red-400' :
        status === 'seen' ? 'bg-blue-500/20 text-blue-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {badges[status] || status}
      </span>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Academic Records</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAdding(!adding)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            + Add
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            {expanded ? 'Hide' : 'Show'} ({records.length})
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 border-b border-white/10 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Semester Number"
              value={formData.semester_number}
              onChange={(e) => setFormData({ ...formData, semester_number: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="CGPA"
              value={formData.cgpa}
              onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            />
          </div>
          <input
            type="number"
            step="0.01"
            placeholder="Percentage"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-lg border border-white/10 py-2 text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {expanded && records.length > 0 && (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">Semester {record.semester_number}</p>
                <p className="text-sm text-white/60">
                  {record.cgpa && `CGPA: ${record.cgpa}`} 
                  {record.percentage && ` • ${record.percentage}%`}
                </p>
              </div>
              {getStatusBadge(record.status)}
            </div>
          ))}
        </div>
      )}

      {!expanded && records.length > 0 && (
        <p className="text-sm text-white/40">{records.length} records</p>
      )}
    </div>
  )
}

function CertificationsSection() {
  const [certifications, setCertifications] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    org: '',
    date: '',
    file: null,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/student/certifications/').then((r) => setCertifications(r.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/student/certifications/', formData)
      setCertifications([...certifications, data])
      setAdding(false)
      setFormData({ title: '', org: '', date: '', file: null })
    } catch (err) {
      console.error('Failed to add certification:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      submitted: '📤 Submitted',
      seen: '👁️ Seen', 
      approved: '✅ Approved',
      rejected: '❌ Rejected'
    }
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${
        status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
        status === 'rejected' ? 'bg-red-500/20 text-red-400' :
        status === 'seen' ? 'bg-blue-500/20 text-blue-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {badges[status] || status}
      </span>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Certifications</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAdding(!adding)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            + Add
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            {expanded ? 'Hide' : 'Show'} ({certifications.length})
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 border-b border-white/10 pb-4">
          <input
            type="text"
            placeholder="Certification Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Issuing Organization"
            value={formData.org}
            onChange={(e) => setFormData({ ...formData, org: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            required
          />
          <input
            type="date"
            placeholder="Date Received"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            required
          />
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-lg border border-white/10 py-2 text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {expanded && certifications.length > 0 && (
        <div className="space-y-2">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">{cert.title}</p>
                <p className="text-sm text-white/60">{cert.org} • {new Date(cert.date).toLocaleDateString()}</p>
              </div>
              {getStatusBadge(cert.status)}
            </div>
          ))}
        </div>
      )}

      {!expanded && certifications.length > 0 && (
        <p className="text-sm text-white/40">{certifications.length} certifications</p>
      )}
    </div>
  )
}

function AchievementsSection() {
  const [achievements, setAchievements] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/student/achievements/').then((r) => setAchievements(r.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/student/achievements/', formData)
      setAchievements([...achievements, data])
      setAdding(false)
      setFormData({ title: '', description: '', date: '' })
    } catch (err) {
      console.error('Failed to add achievement:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      submitted: '📤 Submitted',
      seen: '👁️ Seen', 
      approved: '✅ Approved',
      rejected: '❌ Rejected'
    }
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${
        status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
        status === 'rejected' ? 'bg-red-500/20 text-red-400' :
        status === 'seen' ? 'bg-blue-500/20 text-blue-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {badges[status] || status}
      </span>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Achievements</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAdding(!adding)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            + Add
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            {expanded ? 'Hide' : 'Show'} ({achievements.length})
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 border-b border-white/10 pb-4">
          <input
            type="text"
            placeholder="Achievement Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            rows={3}
            required
          />
          <input
            type="date"
            placeholder="Date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-lg border border-white/10 py-2 text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {expanded && achievements.length > 0 && (
        <div className="space-y-2">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div className="flex-1">
                <p className="text-white font-medium">{achievement.title}</p>
                <p className="text-sm text-white/60">{achievement.description}</p>
                <p className="text-xs text-white/40">{new Date(achievement.date).toLocaleDateString()}</p>
              </div>
              {getStatusBadge(achievement.status)}
            </div>
          ))}
        </div>
      )}

      {!expanded && achievements.length > 0 && (
        <p className="text-sm text-white/40">{achievements.length} achievements</p>
      )}
    </div>
  )
}

function DocumentsSection() {
  const [documents, setDocuments] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    file: null,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/student/documents/').then((r) => setDocuments(r.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/student/documents/', formData)
      setDocuments([...documents, data])
      setAdding(false)
      setFormData({ title: '', file: null })
    } catch (err) {
      console.error('Failed to upload document:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      submitted: '📤 Submitted',
      seen: '👁️ Seen', 
      approved: '✅ Approved',
      rejected: '❌ Rejected'
    }
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${
        status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
        status === 'rejected' ? 'bg-red-500/20 text-red-400' :
        status === 'seen' ? 'bg-blue-500/20 text-blue-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {badges[status] || status}
      </span>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Documents</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAdding(!adding)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            + Upload
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            {expanded ? 'Hide' : 'Show'} ({documents.length})
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 border-b border-white/10 pb-4">
          <input
            type="text"
            placeholder="Document Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            required
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-lg border border-white/10 py-2 text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {expanded && documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">{doc.title}</p>
                <p className="text-sm text-white/60">📄 Document</p>
              </div>
              {getStatusBadge(doc.status)}
            </div>
          ))}
        </div>
      )}

      {!expanded && documents.length > 0 && (
        <p className="text-sm text-white/40">{documents.length} documents</p>
      )}
    </div>
  )
}

function ProfileSection({ profile, user, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || user?.first_name || '',
    last_name: profile?.last_name || user?.last_name || '',
    phone: profile?.phone || user?.phone || '',
    date_of_birth: profile?.date_of_birth || user?.date_of_birth || '',
    linkedin_url: profile?.linkedin_url || user?.linkedin_url || '',
    github_url: profile?.github_url || user?.github_url || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put('/student/profile/', formData)
      onUpdate(data)
      setEditing(false)
    } catch (err) {
      console.error('Profile update failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-4 font-semibold text-white">Profile Setup</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
            />
          </div>
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <input
            type="url"
            placeholder="GitHub URL"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 rounded-lg border border-white/10 py-2 text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Profile Setup</h3>
          <p className="text-sm text-white/60">
            {profile?.first_name || user?.first_name ? `${profile?.first_name || user?.first_name} ${profile?.last_name || user?.last_name}` : 'Complete your profile'}
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
        >
          {profile?.first_name ? 'Edit' : 'Setup'}
        </button>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.get('/student/profile/').then((r) => setProfile(r.data)).catch(() => {})
  }, [])

  const name = profile?.name || user?.name || 'Student'

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile)
  }

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
          <ProfileSection profile={profile} user={user} onUpdate={handleProfileUpdate} />
          <AcademicRecordsSection />
          <CertificationsSection />
          <AchievementsSection />
          <DocumentsSection />
        </section>
      </main>
    </div>
  )
}
