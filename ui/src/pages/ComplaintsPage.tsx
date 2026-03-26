import { useState } from 'react'
import { MessageSquare, AlertCircle, CheckCircle, Clock, MapPin, Plus, Filter, Loader2 } from 'lucide-react'
import { useComplaints, useCreateComplaint } from '../services/apiClient'
import { useToast } from '../components/Toast'
import type { CreateComplaintRequest } from '../types/api'

const ComplaintsPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [formData, setFormData] = useState<CreateComplaintRequest>({
    title: '',
    description: '',
    category: '',
    location: '',
    submittedBy: '',
    priority: 'medium',
    status: 'pending'
  })

  const toast = useToast()

  const { data: complaints, loading, error, refetch } = useComplaints(
    selectedStatus === 'all' ? undefined : selectedStatus
  )
  const { mutate: createComplaint, loading: creating } = useCreateComplaint()

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

  // Status is filtered server-side
  const filteredComplaints = complaints || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createComplaint(formData)
      if (result) {
        await refetch()
        setShowForm(false)
        setFormData({
          title: '',
          description: '',
          category: '',
          location: '',
          submittedBy: '',
          priority: 'medium',
          status: 'pending'
        })
        toast.success('Complaint submitted successfully! We\'ll review it shortly.')
      }
    } catch {
      toast.error('Failed to submit complaint. Please try again.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="text-green-600" size={20} />
      case 'in-progress':
        return <Clock className="text-yellow-600" size={20} />
      case 'pending':
        return <AlertCircle className="text-red-600" size={20} />
      default:
        return <MessageSquare className="text-gray-600" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load complaints</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select 
                    className="input-field" 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select 
                    className="input-field" 
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
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
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Submitting...' : 'Submit Complaint'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        <div className="space-y-6">
          {filteredComplaints.map((complaint: Complaint) => (
            <div key={complaint.id} className="card">
              {/* Header */}
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

              {/* Description */}
              <p className="text-gray-600 mb-4">{complaint.description}</p>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2" size={16} />
                  <span>{complaint.location}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Category:</strong> {complaint.category}
                </div>
              </div>

              {/* Response */}
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

        {/* Empty State */}
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

        {/* Stats */}
        {filteredComplaints.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complaint Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {filteredComplaints.length}
                </div>
                <div className="text-gray-600">Total Complaints</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {filteredComplaints.filter(c => c.status === 'resolved').length}
                </div>
                <div className="text-gray-600">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {filteredComplaints.filter(c => c.status === 'in-progress').length}
                </div>
                <div className="text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {filteredComplaints.filter(c => c.status === 'pending').length}
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
