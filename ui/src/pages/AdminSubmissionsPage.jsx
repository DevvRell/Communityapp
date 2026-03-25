import { useState, useEffect, useCallback } from 'react'
import { Shield, Filter, CheckCircle, XCircle, Image, Building2, MessageSquare, Calendar, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { adminAPI } from '../services/api'

const SUBMISSION_TYPES = [
  { value: 'all',       label: 'All types',   icon: Filter },
  { value: 'photo',     label: 'Photos',      icon: Image },
  { value: 'business',  label: 'Businesses',  icon: Building2 },
  { value: 'complaint', label: 'Complaints',  icon: MessageSquare },
  { value: 'event',     label: 'Events',      icon: Calendar },
]

const STATUSES = [
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const getSubmissionLabel = (sub) => {
  const d = sub.data
  if (sub.type === 'photo')     return `${d.originalName} · by ${d.submittedBy || 'Anonymous'}`
  if (sub.type === 'business')  return `${d.name} · ${d.category}${d.sub_category ? ` / ${d.sub_category}` : ''}`
  if (sub.type === 'complaint') return `${d.title} · ${d.category} · by ${d.submittedBy}`
  if (sub.type === 'event')     return `${d.title} · ${d.date} · ${d.organizer}`
  return ''
}

const getSubmissionDetail = (sub) => {
  const d = sub.data
  if (sub.type === 'business')  return `${d.address}${d.borough ? `, ${d.borough}` : ''}${d.zip ? ` ${d.zip}` : ''} · ${d.phone || 'No phone'}`
  if (sub.type === 'complaint') return d.description?.slice(0, 120)
  if (sub.type === 'event')     return `${d.location} · ${d.time}`
  return null
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' }) : ''

const AdminSubmissionsPage = () => {
  const [typeFilter, setTypeFilter]       = useState('all')
  const [statusFilter, setStatusFilter]   = useState('pending')
  const [submissions, setSubmissions]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [processingId, setProcessingId]   = useState(null)
  const [actionError, setActionError]     = useState(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminAPI.getSubmissions(
        typeFilter !== 'all' ? typeFilter : undefined,
        statusFilter
      )
      setSubmissions(res.submissions || [])
    } catch (e) {
      setError(e.message || 'Failed to load submissions. Check your admin API key.')
    } finally {
      setLoading(false)
    }
  }, [typeFilter, statusFilter])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const handleApprove = async (type, id) => {
    const key = `${type}-${id}`
    setProcessingId(key)
    setActionError(null)
    try {
      await adminAPI.approve(type, id)
      await fetchSubmissions()
    } catch (e) {
      setActionError(`Failed to approve: ${e.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (type, id) => {
    const key = `${type}-${id}`
    setProcessingId(key)
    setActionError(null)
    try {
      await adminAPI.reject(type, id)
      await fetchSubmissions()
    } catch (e) {
      setActionError(`Failed to reject: ${e.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield className="text-primary-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin – Submissions</h1>
              <p className="text-gray-600">Review and approve or reject community submissions.</p>
            </div>
          </div>
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Action error banner */}
        {actionError && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            <AlertCircle size={16} />
            {actionError}
            <button onClick={() => setActionError(null)} className="ml-auto text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field py-2"
            >
              {SUBMISSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-2"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <span className="text-sm text-gray-500 ml-auto">
            {loading ? 'Loading...' : `${submissions.length} result${submissions.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary-600" size={36} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="mx-auto text-red-400 mb-3" size={48} />
            <p className="text-gray-700 font-medium mb-1">Could not load submissions</p>
            <p className="text-sm text-gray-500">{error}</p>
            <p className="text-xs text-gray-400 mt-2">Make sure VITE_ADMIN_API_KEY is set in your .env file.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && submissions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CheckCircle className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No submissions match the current filters.</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter === 'pending' ? 'All caught up! No pending submissions.' : 'Try changing the filters above.'}
            </p>
          </div>
        )}

        {/* Submissions list */}
        {!loading && !error && submissions.length > 0 && (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const TypeIcon = SUBMISSION_TYPES.find(t => t.value === sub.type)?.icon || Filter
              const isPending = sub.submissionStatus === 'PENDING'
              const key = `${sub.type}-${sub.id}`
              const isProcessing = processingId === key
              const detail = getSubmissionDetail(sub)

              return (
                <div key={key} className="bg-white rounded-lg shadow-md p-6 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {sub.type === 'photo' && sub.data.storedPath ? (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                        <Image className="text-gray-400" size={24} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                        <TypeIcon className="text-primary-600" size={20} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 capitalize">{sub.type}</span>
                        <span className="text-sm text-gray-400">#{sub.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          sub.submissionStatus === 'PENDING'  ? 'bg-yellow-100 text-yellow-800' :
                          sub.submissionStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sub.submissionStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 font-medium">{getSubmissionLabel(sub)}</p>
                      {detail && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{detail}</p>}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(sub.data.createdAt)}</p>
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(sub.type, sub.id)}
                        disabled={isProcessing}
                        className="btn-primary flex items-center gap-1 text-sm disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(sub.type, sub.id)}
                        disabled={isProcessing}
                        className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={16} />}
                        Reject
                      </button>
                    </div>
                  )}

                  {!isPending && (
                    <div className="text-sm text-gray-400 italic shrink-0">
                      {sub.submissionStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSubmissionsPage
