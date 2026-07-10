import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail, Lightbulb, Search, RefreshCw, Loader2, AlertCircle,
  Inbox, ClipboardCheck, Database, Copy, Check,
} from 'lucide-react'
import { adminDataAPI, adminAPI, ApiClientError } from '../services/api'
import { useToast } from '../components/Toast'
import PageHeader from '../components/ui/PageHeader'

const TABS = [
  { key: 'subscribers', label: 'Email Sign-ups', table: 'subscribers', icon: Mail },
  { key: 'feedback',    label: 'Feedback',       table: 'feedback',    icon: Lightbulb },
]

const CATEGORY_LABELS = {
  feature_request: 'Feature request',
  gamification: 'Gamification idea',
  design: 'Design / UX',
  bug: 'Bug or problem',
  content: 'Content / data',
  general: 'General thought',
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const AdminEmailsPage = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('subscribers')
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const activeTable = TABS.find((t) => t.key === activeTab)?.table

  const handleAuthError = useCallback((e) => {
    if (e instanceof ApiClientError && (e.statusCode === 403 || e.statusCode === 401)) {
      adminAPI.logout()
      navigate('/admin/login', { replace: true })
      return true
    }
    return false
  }, [navigate])

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminDataAPI.list(activeTable, {
        page: 1,
        limit: 200,
        search: search.trim() || undefined,
      })
      setRows(res.data || [])
      setTotal(res.total || 0)
    } catch (e) {
      if (!handleAuthError(e)) setError(e.message || 'Failed to load submissions.')
    } finally {
      setLoading(false)
    }
  }, [activeTable, search, handleAuthError])

  useEffect(() => { fetchRows() }, [fetchRows])

  const switchTab = (key) => {
    setActiveTab(key)
    setSearch('')
    setRows([])
    setError(null)
  }

  const copyEmail = async (id, email) => {
    if (!email) return
    try {
      await navigator.clipboard.writeText(email)
      setCopiedId(id)
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }

  const copyAllEmails = async () => {
    const emails = rows.map((r) => r.email).filter(Boolean)
    if (!emails.length) return
    try {
      await navigator.clipboard.writeText(emails.join(', '))
      toast.success(`Copied ${emails.length} email${emails.length === 1 ? '' : 's'} to clipboard.`)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }

  const isSubscribers = activeTab === 'subscribers'

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        eyebrow="Admin Console"
        title={<>Landing-page <em className="text-gold-300">inbox.</em></>}
        subtitle="Email sign-ups and feedback submitted from the launch page."
        size="sm"
      >
        <div className="flex items-center gap-2">
          <Link
            to="/admin/submissions"
            className="inline-flex items-center gap-2 text-sm text-cream-100 bg-forest-800/60 border border-cream-100/15 rounded-lg px-3 py-2 hover:bg-forest-800 transition-colors"
          >
            <ClipboardCheck size={15} /> Review queue
          </Link>
          <Link
            to="/admin/data"
            className="inline-flex items-center gap-2 text-sm text-cream-100 bg-forest-800/60 border border-cream-100/15 rounded-lg px-3 py-2 hover:bg-forest-800 transition-colors"
          >
            <Database size={15} /> Manage data
          </Link>
          <button
            onClick={fetchRows}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-cream-100 bg-forest-800/60 border border-cream-100/15 rounded-lg px-3 py-2 hover:bg-forest-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </PageHeader>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = t.key === activeTab
            return (
              <button
                key={t.key}
                onClick={() => switchTab(t.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-forest-900 text-cream-50'
                    : 'bg-white text-forest-700 border border-forest-100 hover:bg-cream-100'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-4 mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={18} className="text-forest-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isSubscribers ? 'Search emails…' : 'Search feedback…'}
              className="input-field w-full py-2"
            />
          </div>
          <span className="text-sm text-forest-500">
            {loading ? 'Loading…' : `${total} ${isSubscribers ? 'sign-up' : 'submission'}${total !== 1 ? 's' : ''}`}
          </span>
          {isSubscribers && rows.length > 0 && (
            <button
              onClick={copyAllEmails}
              className="inline-flex items-center gap-1.5 text-sm text-forest-700 bg-cream-100 hover:bg-cream-200 rounded-lg px-3 py-2 transition-colors"
            >
              <Copy size={15} /> Copy all
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-forest-600" size={32} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-12 text-center">
            <AlertCircle className="mx-auto text-red-400 mb-3" size={40} />
            <p className="text-forest-700 font-medium">Could not load submissions</p>
            <p className="text-sm text-forest-500 mt-1">{error}</p>
            <p className="text-xs text-forest-400 mt-2">Try logging out and back in, or check that the API is running.</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rows.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-12 text-center">
            <Inbox className="mx-auto text-forest-200 mb-3" size={40} />
            <p className="text-forest-600 font-medium">
              {search.trim()
                ? 'No results match your search.'
                : isSubscribers
                ? 'No email sign-ups yet.'
                : 'No feedback yet.'}
            </p>
            <p className="text-sm text-forest-400 mt-1">
              {isSubscribers
                ? 'Emails from the “Reserve my spot” form on the landing page appear here.'
                : 'Messages from the feedback form on the landing page appear here.'}
            </p>
          </div>
        )}

        {/* Subscribers list */}
        {!loading && !error && rows.length > 0 && isSubscribers && (
          <div className="bg-white rounded-xl shadow-sm border border-forest-100 overflow-hidden divide-y divide-forest-50">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-3 px-4 py-3 hover:bg-cream-50/60">
                <div className="w-9 h-9 rounded-lg bg-forest-900/5 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-forest-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <a href={`mailto:${row.email}`} className="text-forest-800 font-medium hover:text-gold-700 break-all">
                    {row.email}
                  </a>
                  <p className="text-xs text-forest-400 mt-0.5">
                    {formatDate(row.createdAt)}
                    {row.source ? ` · via ${row.source}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => copyEmail(row.id, row.email)}
                  className="p-1.5 text-forest-400 hover:text-forest-800 hover:bg-cream-100 rounded-lg transition-colors shrink-0"
                  title="Copy email"
                >
                  {copiedId === row.id ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Feedback list */}
        {!loading && !error && rows.length > 0 && !isSubscribers && (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="bg-white rounded-xl shadow-sm border border-forest-100 p-5">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gold-50 text-gold-700 border border-gold-200">
                    {CATEGORY_LABELS[row.category] || row.category || 'General'}
                  </span>
                  {row.email ? (
                    <a href={`mailto:${row.email}`} className="text-sm text-forest-700 hover:text-gold-700 inline-flex items-center gap-1">
                      <Mail size={13} /> {row.email}
                    </a>
                  ) : (
                    <span className="text-sm text-forest-400">No email left</span>
                  )}
                  <span className="text-xs text-forest-400 ml-auto">{formatDate(row.createdAt)}</span>
                </div>
                <p className="text-sm text-forest-800 whitespace-pre-wrap leading-relaxed">{row.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminEmailsPage
