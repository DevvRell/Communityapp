import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Phone, Globe, Star, Filter, Building2, Loader2, Plus, X } from 'lucide-react'
import { useBusinesses, useSearchBusinesses, useCreateBusiness } from '../services/apiClient'
import { useToast } from '../components/Toast'
import { useDebounce } from '../hooks/useDebounce'
import type { Business, CreateBusinessRequest } from '../types/api'

const BusinessDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300)
  const { data: businesses, loading, error, refetch } = useBusinesses(selectedCategory === 'all' ? undefined : selectedCategory)
  const { mutate: createBusiness, loading: creating, error: createError } = useCreateBusiness()
  const hasSearchTerm = debouncedSearchTerm.length > 0
  const { data: searchResults, loading: searchLoading } = useSearchBusinesses(debouncedSearchTerm)

  // Auto-focus search input when user starts typing (if not already focused)
  useEffect(() => {
    if (searchTerm.length === 1 && searchInputRef.current && document.activeElement !== searchInputRef.current) {
      // Small delay to ensure the input is ready
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 10)
    }
  }, [searchTerm])

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Food', label: 'Food & Dining' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Non-Profit', label: 'Non-Profit' },
    { value: 'General Services', label: 'General Services' },
    { value: 'Professional Services', label: 'Professional Services' },
    { value: 'Family Services', label: 'Family Services' },
    { value: 'Entertainment', label: 'Entertainment' },
  ]

  // When searching, use search results; otherwise use category-filtered list from API
  const displayedBusinesses: Business[] = hasSearchTerm ? (searchResults || []) : (businesses || [])

  if (loading && !hasSearchTerm) {
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
          <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load businesses</h3>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Directory</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and support local businesses in your community. Find everything you need right in your neighborhood.
          </p>
        </div>

        {/* Search, Filter & Add */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${searchTerm ? 'text-primary-600' : 'text-gray-400'} transition-colors duration-200`} size={20} />
              {hasSearchTerm && searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 animate-spin" size={20} />
              )}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`input-field pl-10 ${searchTerm ? 'pr-10 border-primary-300 focus:border-primary-500 focus:ring-primary-500' : ''} transition-all duration-200`}
                autoFocus={false}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSearchTerm('') // Clear search when changing category
                }}
                className="input-field pl-10"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-end">
              <span className="text-gray-600">
                {hasSearchTerm && searchLoading ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Searching...</span>
                  </span>
                ) : (
                  <>
                    {displayedBusinesses.length} business{displayedBusinesses.length !== 1 ? 'es' : ''} found
                    {hasSearchTerm && ` for "${searchTerm.trim()}"`}
                  </>
                )}
              </span>
            </div>

            {/* Add Business Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Business</span>
            </button>
          </div>
        </div>

        {/* Add Business Form */}
        {showAddForm && (
          <AddBusinessForm
            onSubmit={async (data) => {
              try {
                const result = await createBusiness(data)
                if (result) {
                  setShowAddForm(false)
                  refetch()
                  toast.success('Business submitted successfully! It will appear after admin approval.')
                }
              } catch {
                toast.error('Failed to add business. Please try again.')
              }
            }}
            onCancel={() => setShowAddForm(false)}
            loading={creating}
            error={createError}
            categories={categories.filter(c => c.value !== 'all')}
          />
        )}

        {/* Business Listings */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${hasSearchTerm && searchLoading ? 'opacity-75' : 'opacity-100'}`}>
          {displayedBusinesses.map((business: Business) => (
            <div
              key={business.id}
              className="card hover:shadow-lg transition-all duration-300"
            >
              {/* Business Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{business.name}</h3>
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      <span className="text-sm text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        {business.category}
                      </span>
                      {business.sub_category && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {business.sub_category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400" size={16} />
                  <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({business.reviews})</span>
                </div>
              </div>

              {/* Description */}
              {business.description && (
                <p className="text-gray-600 mb-4">{business.description}</p>
              )}

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 shrink-0" size={16} />
                  {business.address}{business.borough ? `, ${business.borough}` : ''}{business.zip ? ` ${business.zip}` : ''}
                </div>
                {business.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 shrink-0" size={16} />
                    {business.phone}
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="mr-2 shrink-0" size={16} />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline truncate"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Hours */}
              {business.hours && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Hours:</strong> {business.hours}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                {business.website ? (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex-1 text-sm text-center"
                  >
                    Visit
                  </a>
                ) : business.email ? (
                  <a
                    href={`mailto:${business.email}`}
                    className="btn-primary flex-1 text-sm text-center"
                  >
                    Contact
                  </a>
                ) : null}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${business.address} ${business.borough ?? ''} ${business.zip ?? ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 text-sm text-center"
                >
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayedBusinesses.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Add Business Form Component
// ============================================================================

interface AddBusinessFormProps {
  onSubmit: (data: CreateBusinessRequest) => Promise<void>
  onCancel: () => void
  loading: boolean
  error: string | null
  categories: { value: string; label: string }[]
}

const AddBusinessForm = ({ onSubmit, onCancel, loading, error, categories }: AddBusinessFormProps) => {
  const [formData, setFormData] = useState<CreateBusinessRequest>({
    name: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Business</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g. Joe's Coffee Shop"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} required className="input-field">
            <option value="">Select a category</option>
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="input-field"
            rows={3}
            placeholder="Briefly describe the business..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="123 Main St"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="contact@business.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hours (optional)</label>
          <input
            type="text"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            className="input-field"
            placeholder="Mon-Fri 9am-5pm"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Business</span>
            )}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default BusinessDirectory
