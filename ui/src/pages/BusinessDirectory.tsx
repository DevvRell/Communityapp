import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Phone, Globe, Star, Filter, Building2, Loader2 } from 'lucide-react'
import { useBusinesses, useSearchBusinesses } from '../services/apiClient'
import { useDebounce } from '../hooks/useDebounce'
import type { Business } from '../types/api'

const BusinessDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300)
  const { data: businesses, loading, error } = useBusinesses(selectedCategory === 'all' ? undefined : selectedCategory)
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
    { value: 'Professional Services', label: 'Professional Services' },
    { value: 'General Services', label: 'General Services' },
    { value: 'Non-Profit', label: 'Non-Profit' },
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

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>

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
                ) : (
                  <button className="btn-primary flex-1 text-sm" disabled>
                    No Contact
                  </button>
                )}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${business.address} ${business.borough ?? ''} ${business.zip ?? ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
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

export default BusinessDirectory
