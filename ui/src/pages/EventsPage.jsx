import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, Search, Filter, Plus } from 'lucide-react'

// Mock events data — swap this file for EventsPage.tsx when API is ready
const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Community Cleanup Day',
    category: 'community',
    description: "Join us for our monthly community cleanup event. Let's keep our neighborhood beautiful!",
    date: '2026-04-15',
    time: '09:00 AM - 12:00 PM',
    location: 'Central Park, Main Entrance',
    organizer: 'Neighborhood Association',
    attendees: 45,
    maxAttendees: 100,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    title: 'Local Business Networking',
    category: 'business',
    description: 'Monthly networking event for local business owners to connect and collaborate.',
    date: '2026-04-20',
    time: '06:00 PM - 08:00 PM',
    location: 'Community Center, Conference Room A',
    organizer: 'Business Development Group',
    attendees: 28,
    maxAttendees: 50,
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop',
  },
  {
    id: 3,
    title: 'Farmers Market',
    category: 'food',
    description: 'Weekly farmers market featuring local produce, artisanal goods, and live music.',
    date: '2026-04-17',
    time: '10:00 AM - 04:00 PM',
    location: 'Downtown Plaza',
    organizer: 'Local Farmers Cooperative',
    attendees: 120,
    maxAttendees: 200,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
  },
  {
    id: 4,
    title: 'Youth Basketball Tournament',
    category: 'sports',
    description: 'Annual basketball tournament for youth ages 12-18. Registration required.',
    date: '2026-04-24',
    time: '09:00 AM - 06:00 PM',
    location: 'Community Gymnasium',
    organizer: 'Youth Sports League',
    attendees: 64,
    maxAttendees: 80,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=200&fit=crop',
  },
  {
    id: 5,
    title: 'Art Exhibition Opening',
    category: 'arts',
    description: 'Opening night for the local artists exhibition featuring works from community members.',
    date: '2026-04-22',
    time: '07:00 PM - 09:00 PM',
    location: 'Community Art Gallery',
    organizer: 'Local Artists Collective',
    attendees: 35,
    maxAttendees: 60,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop',
  },
  {
    id: 6,
    title: 'Emergency Preparedness Workshop',
    category: 'education',
    description: 'Learn essential emergency preparedness skills and create a family emergency plan.',
    date: '2026-04-18',
    time: '02:00 PM - 04:00 PM',
    location: 'Fire Station #3, Training Room',
    organizer: 'Emergency Services Department',
    attendees: 22,
    maxAttendees: 40,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop',
  },
]

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'community', label: 'Community' },
    { value: 'business', label: 'Business' },
    { value: 'food', label: 'Food & Culture' },
    { value: 'sports', label: 'Sports & Recreation' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'education', label: 'Education' }
  ]

  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const upcomingEvents = MOCK_EVENTS.slice(0, 4)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAttendancePercentage = (attendees, maxAttendees) => {
    return Math.round((attendees / maxAttendees) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay connected with your community through local events, activities, and gatherings.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </span>
            </div>

            <button className="btn-primary flex items-center justify-center space-x-2">
              <Plus size={16} />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gray-200 relative">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <Calendar className="text-white" size={48} />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {getAttendancePercentage(event.attendees, event.maxAttendees)}% Full
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2" size={16} />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-2" size={16} />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2" size={16} />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2" size={16} />
                    {event.attendees}/{event.maxAttendees} attending
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Organized by:</strong> {event.organizer}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button className="btn-primary flex-1 text-sm">Attend</button>
                  <button className="btn-secondary text-sm">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter to find events.
            </p>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-primary-600 font-medium mb-1">
                    {formatDate(event.date)}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-1" size={14} />
                    {event.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage
