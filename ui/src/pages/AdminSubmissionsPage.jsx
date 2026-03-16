import { useState, useCallback } from 'react'
import { Shield, Filter, CheckCircle, XCircle, Image, Building2, MessageSquare, Calendar, AlertCircle, RefreshCw } from 'lucide-react'
import { getSubmissions, approveSubmission, rejectSubmission, resetStore } from '../services/mockStore'

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
  if (sub.type === 'business')  return `${d.name} · ${d.category}`
  if (sub.type === 'complaint') return `${d.title} · ${d.category} · by ${d.submittedBy}`
  if (sub.type === 'event')     return `${d.title} · ${d.date} · ${d.organizer}`
  return ''
}

const getSubmissionDetail = (sub) => {
  const d = sub.data
  if (sub.type === 'business')  return `${d.address} · ${d.phone}`
  if (sub.type === 'complaint') return d.description?.slice(0, 120)
  if (sub.type === 'event')     return `${d.location} · ${d.time}`
  return null
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' }) : ''

const AdminSubmissionsPage = () => {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [processingId, setProcessingId] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [, forceRender] = useState(0)
  const refresh = useCallback(() => forceRender(n => n + 1), [])

  const submissions = getSubmissions(typeFilter, statusFilter)

  const handleApprove = (type, id) => {
    setProcessingId(`${type}-${id}`)
    approveSubmission(type, id)
    setProcessingId(null)
    refresh()
  }

  const handleReject = (type, id) => {
    setProcessingId(`${type}-${id}`)
    rejectSubmission(type, id)
    setProcessingId(null)
    refresh()
  }

  const handleReset = () => {
    resetStore()
    setShowResetConfirm(false)
    refresh()
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

          {/* Reset button (dev only) */}
          <div className="relative">
            {showResetConfirm ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="text-red-600 shrink-0" size={18} />
                <span className="text-sm text-red-700">Reset all mock data?</span>
                <button onClick={handleReset} className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700">Yes, reset</button>
                <button onClick={() => setShowResetConfirm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
              >
                <RefreshCw size={15} />
                Reset mock data
              </button>
            )}
          </div>
        </div>

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
            {submissions.length} result{submissions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Submissions list */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CheckCircle className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No submissions match the current filters.</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter === 'pending' ? 'All caught up! No pending submissions.' : 'Try changing the filters above.'}
            </p>
          </div>
        ) : (
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
                    {/* Photo thumbnail or type icon */}
                    {sub.type === 'photo' && sub.data.url ? (
                      <img
                        src={sub.data.url}
                        alt={sub.data.originalName}
                        className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-200"
                      />
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
                        className="btn-primary flex items-center gap-1 text-sm"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(sub.type, sub.id)}
                        disabled={isProcessing}
                        className="btn-secondary text-sm flex items-center gap-1"
                      >
                        <XCircle size={16} />
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
