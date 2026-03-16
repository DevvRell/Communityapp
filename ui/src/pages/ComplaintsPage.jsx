import { useState } from 'react'
import { MessageSquare, AlertCircle, CheckCircle, Clock, MapPin, Plus, Filter } from 'lucide-react'
import { getComplaints, addComplaint, init } from '../services/mockStore'

init()

const COMPLAINT_CATEGORIES = [
  'Infrastructure', 'Roads & Sidewalks', 'Noise',
  'Sanitation', 'Parks & Recreation', 'Traffic', 'Safety', 'Other',
]

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high',   label: 'High',   color: 'bg-red-100 text-red-800' },
]

const STATUSES = [
  { value: 'all',         label: 'All Statuses' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
]

const BLANK_FORM = {
  title: '', description: '', category: '',
  location: '', submittedBy: '', priority: 'medium',
}

const getStatusIcon = (status) => {
  if (status === 'resolved')    return <CheckCircle className="text-green-600" size={20} />
  if (status === 'in-progress') return <Clock className="text-yellow-600" size={20} />
  return <AlertCircle className="text-red-600" size={20} />
}

const getStatusColor = (status) => {
  if (status === 'resolved')    return 'bg-green-100 text-green-800'
  if (status === 'in-progress') return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

const ComplaintsPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [formData, setFormData] = useState(BLANK_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [, forceRender] = useState(0)
  const refresh = () => forceRender(n => n + 1)

  // Only show APPROVED complaints publicly; filter by operational status client-side
  const complaints = getComplaints({ status: selectedStatus === 'all' ? null : selectedStatus })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    addComplaint(formData)
    setSubmitting(false)
    setSuccessMsg('Your complaint has been submitted for review. It will appear publicly once approved.')
    setFormData(BLANK_FORM)
    setShowForm(false)
    refresh()
  }

  const field = (key) => ({
    value: formData[key],
    onChange: (e) => setFormData(f => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Complaints</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Report issues, voice concerns, and track the status of community problems.
            Together we can make our neighborhood better.
          </p>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-800 font-medium">Complaint submitted!</p>
              <p className="text-green-700 text-sm mt-1">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-500 hover:text-green-700 text-xl leading-none">×</button>
          </div>
        )}

        {/* Action bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <button
              onClick={() => { setShowForm(v => !v); setSuccessMsg(null) }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Submit New Complaint</span>
            </button>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field pl-10"
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Complaint form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Complaint</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" className="input-field" required placeholder="Brief description of the issue" {...field('title')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select className="input-field" required {...field('category')}>
                    <option value="">Select a category</option>
                    {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea className="input-field" rows={4} required placeholder="Provide detailed information about the issue..." {...field('description')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input type="text" className="input-field" required placeholder="Where is this issue located?" {...field('location')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                  <select className="input-field" required {...field('priority')}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input type="text" className="input-field" required placeholder="Enter your name" {...field('submittedBy')} />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Complaint'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints list */}
        <div className="space-y-6">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(complaint.status)}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{complaint.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">by {complaint.submittedBy}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{formatDate(complaint.submittedDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITIES.find(p => p.value === complaint.priority)?.color}`}>
                    {complaint.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{complaint.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 shrink-0" size={16} />
                  <span>{complaint.location}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Category:</strong> {complaint.category}
                </div>
              </div>

              {complaint.response && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Official Response:</h4>
                  <p className="text-gray-600">{complaint.response}</p>
                  {complaint.resolvedDate && (
                    <p className="text-sm text-gray-500 mt-2">Resolved on {formatDate(complaint.resolvedDate)}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {complaints.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all'
                ? 'No complaints have been approved yet.'
                : `No complaints with status "${selectedStatus}" found.`}
            </p>
          </div>
        )}

        {/* Stats */}
        {complaints.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complaint Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{complaints.length}</div>
                <div className="text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {complaints.filter(c => c.status === 'resolved').length}
                </div>
                <div className="text-gray-600">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {complaints.filter(c => c.status === 'in-progress').length}
                </div>
                <div className="text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {complaints.filter(c => c.status === 'pending').length}
                </div>
                <div className="text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplaintsPage
