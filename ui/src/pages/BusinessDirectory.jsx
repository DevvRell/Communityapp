import { useState } from 'react'
import { Search, MapPin, Phone, Mail, Star, Filter, Building2, Plus, CheckCircle } from 'lucide-react'
import { getBusinesses, searchBusinesses, addBusiness, init } from '../services/mockStore'

init()

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Services' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
]

const BLANK_FORM = {
  name: '', category: '', description: '', address: '',
  phone: '', email: '', hours: '',
}

const BusinessDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(BLANK_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [, forceRender] = useState(0)
  const refresh = () => forceRender(n => n + 1)

  const hasSearch = searchTerm.trim().length > 0
  const displayed = hasSearch
    ? searchBusinesses(searchTerm.trim())
    : getBusinesses('APPROVED').filter(b =>
        selectedCategory === 'all' || b.category === selectedCategory
      )

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    addBusiness(formData)
    setSubmitting(false)
    setSuccessMsg('Your business has been submitted for review. It will appear in the directory once approved.')
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Directory</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and support local businesses in your community.
          </p>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-800 font-medium">Submission received!</p>
              <p className="text-green-700 text-sm mt-1">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-500 hover:text-green-700 text-xl leading-none">×</button>
          </div>
        )}

        {/* Search, Filter, Submit button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSearchTerm('') }}
                className="input-field pl-10"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600 text-sm">
                {displayed.length} business{displayed.length !== 1 ? 'es' : ''} found
                {hasSearch && ` for "${searchTerm.trim()}"`}
              </span>
              <button
                onClick={() => { setShowForm(v => !v); setSuccessMsg(null) }}
                className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Plus size={16} />
                Add Business
              </button>
            </div>
          </div>
        </div>

        {/* Submission form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit a Business</h2>
            <p className="text-sm text-gray-500 mb-6">Submissions are reviewed before appearing in the directory.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                  <input type="text" className="input-field" required placeholder="e.g. Joe's Coffee" {...field('name')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select className="input-field" required {...field('category')}>
                    <option value="">Select a category</option>
                    {CATEGORIES.filter(c => c.value !== 'all').map(c =>
                      <option key={c.value} value={c.value}>{c.label}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea className="input-field" rows={3} required placeholder="What does this business offer?" {...field('description')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input type="text" className="input-field" required placeholder="123 Main St" {...field('address')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input type="tel" className="input-field" required placeholder="(555) 000-0000" {...field('phone')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" className="input-field" required placeholder="contact@business.com" {...field('email')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                  <input type="text" className="input-field" placeholder="Mon–Fri 9am–5pm" {...field('hours')} />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit for Review'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Listings grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((business) => (
            <div key={business.id} className="card hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{business.name}</h3>
                    <span className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {business.category}
                    </span>
                  </div>
                </div>
                {business.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400" size={16} />
                    <span className="text-sm font-medium">{Number(business.rating).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({business.reviews})</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-4">{business.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 shrink-0" size={16} />{business.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="mr-2 shrink-0" size={16} />{business.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 shrink-0" size={16} />{business.email}
                </div>
              </div>

              {business.hours && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600"><strong>Hours:</strong> {business.hours}</p>
                </div>
              )}

              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                <a href={`mailto:${business.email}`} className="btn-primary flex-1 text-sm text-center">Contact</a>
                <button className="btn-secondary text-sm">Directions</button>
              </div>
            </div>
          ))}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessDirectory
