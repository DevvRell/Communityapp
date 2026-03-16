import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Phone, Mail, Star, Filter, Building2, Loader2 } from 'lucide-react'

// Mock businesses data — swap this file for BusinessDirectory.tsx when API is ready
const MOCK_BUSINESSES = [
  {
    id: 1,
    name: "Green Valley Café",
    category: "restaurant",
    description: "Cozy neighborhood café serving breakfast, lunch, and fresh pastries. Locally sourced ingredients.",
    address: "124 Main Street",
    phone: "(555) 123-4567",
    email: "hello@greenvalleycafe.com",
    rating: 4.6,
    reviews: 128,
    hours: "Mon–Fri 7am–4pm, Sat–Sun 8am–3pm",
  },
  {
    id: 2,
    name: "Downtown Hardware",
    category: "retail",
    description: "Family-owned hardware store with tools, paint, and home improvement supplies for over 30 years.",
    address: "45 Oak Avenue",
    phone: "(555) 234-5678",
    email: "info@downtownhardware.com",
    rating: 4.8,
    reviews: 89,
    hours: "Mon–Sat 8am–6pm",
  },
  {
    id: 3,
    name: "Riverside Dental",
    category: "health",
    description: "Full-service dental care for the whole family. Cleanings, orthodontics, and emergency care.",
    address: "200 River Road, Suite 101",
    phone: "(555) 345-6789",
    email: "appointments@riversidedental.com",
    rating: 4.9,
    reviews: 204,
    hours: "Mon–Thu 8am–6pm, Fri 8am–2pm",
  },
  {
    id: 4,
    name: "Tech Solutions LLC",
    category: "technology",
    description: "Computer repair, IT support, and smart home setup. We come to you.",
    address: "88 Commerce Drive",
    phone: "(555) 456-7890",
    email: "support@techsolutions.com",
    rating: 4.7,
    reviews: 56,
    hours: "Mon–Fri 9am–5pm",
  },
  {
    id: 5,
    name: "Sunset Pizza",
    category: "restaurant",
    description: "Wood-fired pizzas, pasta, and salads. Dine-in or takeout. Family-friendly.",
    address: "312 Elm Street",
    phone: "(555) 567-8901",
    email: "order@sunsetpizza.com",
    rating: 4.5,
    reviews: 312,
    hours: "Tue–Sun 11am–10pm",
  },
  {
    id: 6,
    name: "Community Fitness",
    category: "services",
    description: "Gym, classes, and personal training. Day passes and memberships available.",
    address: "500 Park Lane",
    phone: "(555) 678-9012",
    email: "info@communityfitness.com",
    rating: 4.4,
    reviews: 167,
    hours: "Mon–Fri 5am–10pm, Sat–Sun 7am–8pm",
  },
  {
    id: 7,
    name: "Village Bookshop",
    category: "retail",
    description: "Independent bookstore with new and used books, gifts, and a reading nook.",
    address: "22 Center Street",
    phone: "(555) 789-0123",
    email: "books@villagebookshop.com",
    rating: 4.9,
    reviews: 98,
    hours: "Mon–Sat 10am–6pm",
  },
]

const BusinessDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const searchInputRef = useRef(null)

  const hasSearchTerm = searchTerm.trim().length > 0
  const searchLoading = false

  useEffect(() => {
    if (searchTerm.length === 1 && searchInputRef.current && document.activeElement !== searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 10)
    }
  }, [searchTerm])

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'retail', label: 'Retail' },
    { value: 'services', label: 'Services' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' }
  ]

  const filteredBusinesses = MOCK_BUSINESSES.filter((business) => {
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory
    const matchesSearch = !searchTerm.trim() ||
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

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

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSearchTerm('')
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

            <div className="flex items-center justify-center md:justify-end">
              <span className="text-gray-600">
                {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''} found
                {hasSearchTerm && ` for "${searchTerm.trim()}"`}
              </span>
            </div>
          </div>
        </div>

        {/* Business Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
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
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400" size={16} />
                  <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({business.reviews})</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{business.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2" size={16} />
                  {business.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="mr-2" size={16} />
                  {business.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2" size={16} />
                  {business.email}
                </div>
              </div>

              {business.hours && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Hours:</strong> {business.hours}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                <a
                  href={`mailto:${business.email}`}
                  className="btn-primary flex-1 text-sm text-center"
                >
                  Contact
                </a>
                <button className="btn-secondary text-sm">
                  Directions
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
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
