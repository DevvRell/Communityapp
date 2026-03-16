import { useState } from 'react'
import { MessageSquare, AlertCircle, CheckCircle, Clock, MapPin, Plus, Filter } from 'lucide-react'

// Mock complaints data — swap this file for ComplaintsPage.tsx when API is ready
const MOCK_COMPLAINTS = [
  {
    id: 1,
    title: 'Pothole on Oak Street',
    description: 'Large pothole near the intersection of Oak and Main. Several cars have been damaged.',
    category: 'Roads & Sidewalks',
    location: 'Oak Street & Main',
    status: 'in-progress',
    priority: 'high',
    submittedBy: 'Jane Doe',
    submittedDate: '2026-02-01T10:00:00Z',
    resolvedDate: null,
    response: 'Our crew has been assigned. Repairs scheduled for next week.',
  },
  {
    id: 2,
    title: 'Streetlight out on Park Lane',
    description: 'The streetlight at 500 Park Lane has been dark for two weeks. Safety concern at night.',
    category: 'Infrastructure',
    location: '500 Park Lane',
    status: 'pending',
    priority: 'medium',
    submittedBy: 'John Smith',
    submittedDate: '2026-02-10T14:30:00Z',
    resolvedDate: null,
    response: null,
  },
  {
    id: 3,
    title: 'Noise from construction after hours',
    description: 'Construction on Commerce Drive continues past 7 PM on weekdays. Very disruptive.',
    category: 'Noise',
    location: 'Commerce Drive',
    status: 'resolved',
    priority: 'medium',
    submittedBy: 'Maria Garcia',
    submittedDate: '2026-01-15T09:00:00Z',
    resolvedDate: '2026-01-22T00:00:00Z',
    response: 'Spoke with contractor. They will adhere to 6 PM cutoff. Thank you for reporting.',
  },
  {
    id: 4,
    title: 'Overflowing recycling bins',
    description: 'Recycling bins at the corner of Elm and 5th have been overflowing for days.',
    category: 'Sanitation',
    location: 'Elm Street & 5th Avenue',
    status: 'resolved',
    priority: 'low',
    submittedBy: 'Robert Lee',
    submittedDate: '2026-02-05T11:00:00Z',
    resolvedDate: '2026-02-07T00:00:00Z',
    response: 'Bins have been emptied and pickup schedule verified. Thanks for letting us know.',
  },
  {
    id: 5,
    title: 'Broken swing in Riverside Park',
    description: 'One of the swings in the playground is broken and could be dangerous for kids.',
    category: 'Parks & Recreation',
    location: 'Riverside Park playground',
    status: 'pending',
    priority: 'high',
    submittedBy: 'Sarah Chen',
    submittedDate: '2026-02-12T16:00:00Z',
    resolvedDate: null,
    response: null,
  },
]

const ComplaintsPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    submittedBy: '',
    priority: 'medium',
  })

  const categories = [
    "Infrastructure",
    "Roads & Sidewalks",
    "Noise",
    "Sanitation",
    "Parks & Recreation",
    "Traffic",
    "Safety",
    "Other"
  ]

  const priorities = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" }
  ]

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" }
  ]

  const filteredComplaints = selectedStatus === 'all'
    ? complaints
    : complaints.filter((c) => c.status === selectedStatus)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)
    const newComplaint = {
      id: Math.max(0, ...complaints.map((c) => c.id)) + 1,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      status: 'pending',
      priority: formData.priority,
      submittedBy: formData.submittedBy,
      submittedDate: new Date().toISOString(),
      resolvedDate: null,
      response: null,
    }
    setComplaints((prev) => [newComplaint, ...prev])
    setCreating(false)
    setShowForm(false)
    setFormData({ title: '', description: '', category: '', location: '', submittedBy: '', priority: 'medium' })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="text-green-600" size={20} />
      case 'in-progress': return <Clock className="text-yellow-600" size={20} />
      case 'pending': return <AlertCircle className="text-red-600" size={20} />
      default: return <MessageSquare className="text-gray-600" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

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

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Submit New Complaint</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field pl-10"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Complaint</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="Brief description of the issue"
                    className="input-field"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    className="input-field"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  placeholder="Provide detailed information about the issue..."
                  rows={4}
                  className="input-field"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    placeholder="Where is this issue located?"
                    className="input-field"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                  <select
                    className="input-field"
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="input-field"
                  required
                  value={formData.submittedBy}
                  onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Submitting...' : 'Submit Complaint'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        <div className="space-y-6">
          {filteredComplaints.map((complaint) => (
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
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorities.find(p => p.value === complaint.priority)?.color}`}>
                    {complaint.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{complaint.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2" size={16} />
                  <span>{complaint.location}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Category:</strong> {complaint.category}
                </div>
              </div>

              {complaint.response && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Response:</h4>
                  <p className="text-gray-600">{complaint.response}</p>
                  {complaint.resolvedDate && (
                    <p className="text-sm text-gray-500 mt-2">
                      Resolved on {formatDate(complaint.resolvedDate)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all'
                ? "No complaints have been submitted yet. Be the first to report an issue!"
                : `No complaints with status "${selectedStatus}" found.`
              }
            </p>
          </div>
        )}

        {complaints.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complaint Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{complaints.length}</div>
                <div className="text-gray-600">Total Complaints</div>
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
