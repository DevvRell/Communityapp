import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Search, Filter, Plus, Loader2, X, ImagePlus } from 'lucide-react'
import { useEvents, useUpcomingEvents, useCreateEvent, useAttendEvent } from '../services/apiClient'
import { useToast } from '../components/Toast'
import type { Event, CreateEventRequest } from '../types/api'

const ATTENDED_EVENTS_KEY = 'cb5_attended_events'

function getAttendedEvents(): number[] {
  try {
    const stored = localStorage.getItem(ATTENDED_EVENTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function markEventAttended(eventId: number) {
  const attended = getAttendedEvents()
  if (!attended.includes(eventId)) {
    attended.push(eventId)
    localStorage.setItem(ATTENDED_EVENTS_KEY, JSON.stringify(attended))
  }
}

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [attendedEvents, setAttendedEvents] = useState<number[]>([])

  const toast = useToast()

  const { data: events, loading, error, refetch } = useEvents(
    selectedCategory === 'all' ? undefined : selectedCategory
  )
  const { data: upcomingEvents } = useUpcomingEvents()
  const { mutate: createEvent, loading: creating, error: createError } = useCreateEvent()
  const { mutate: attendEvent } = useAttendEvent()

  useEffect(() => {
    setAttendedEvents(getAttendedEvents())
  }, [])

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'community', label: 'Community' },
    { value: 'business', label: 'Business' },
    { value: 'food', label: 'Food & Culture' },
    { value: 'sports', label: 'Sports & Recreation' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'education', label: 'Education' }
  ]

  // Category is filtered server-side; search is client-side
  const filteredEvents = (events || []).filter((event: Event) => {
    if (!searchTerm.trim()) return true
    return event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           event.description.toLowerCase().includes(searchTerm.toLowerCase())
  })

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
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load events</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getAttendancePercentage = (attendees: number, maxAttendees: number) => {
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
            {/* Search */}
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

            {/* Category Filter */}
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

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-end">
              <span className="text-gray-600">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Add Event Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Add Event Form */}
        {showAddForm && (
          <AddEventForm
            onSubmit={async (fd) => {
              try {
                const result = await createEvent(fd)
                if (result) {
                  setShowAddForm(false)
                  refetch()
                  toast.success('Event submitted! It will appear after admin approval.')
                }
              } catch {
                toast.error('Failed to create event. Please try again.')
              }
            }}
            onCancel={() => setShowAddForm(false)}
            loading={creating}
            error={createError}
          />
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event: Event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Event Image */}
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

              {/* Event Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                {/* Event Details */}
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

                {/* Organizer */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Organized by:</strong> {event.organizer}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    className={`flex-1 text-sm ${attendedEvents.includes(event.id) ? 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg px-4 py-2 font-medium' : 'btn-primary'}`}
                    disabled={attendedEvents.includes(event.id)}
                    onClick={async () => {
                      if (attendedEvents.includes(event.id)) return
                      try {
                        const result = await attendEvent({ id: event.id })
                        if (result) {
                          markEventAttended(event.id)
                          setAttendedEvents(getAttendedEvents())
                          refetch()
                          toast.success(`You're attending "${event.title}"!`)
                        }
                      } catch {
                        toast.error('Could not register attendance. Please try again.')
                      }
                    }}
                  >
                    {attendedEvents.includes(event.id) ? 'Attending' : 'Attend'}
                  </button>
                  <button className="btn-secondary text-sm">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter to find events.
            </p>
          </div>
        )}

        {/* Upcoming Events Preview */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEvents.slice(0, 4).map((event: Event) => (
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

// ============================================================================
// Add Event Form Component
// ============================================================================

interface AddEventFormProps {
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
  loading: boolean
  error: string | null
}

const AddEventForm = ({ onSubmit, onCancel, loading, error }: AddEventFormProps) => {
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    category: 'Community',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    maxAttendees: 50,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttendees' ? parseInt(value) || 0 : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', formData.title)
    fd.append('category', formData.category)
    fd.append('description', formData.description)
    fd.append('date', formData.date)
    fd.append('time', formData.time)
    fd.append('location', formData.location)
    fd.append('organizer', formData.organizer)
    fd.append('maxAttendees', String(formData.maxAttendees))
    if (imageFile) fd.append('image', imageFile)
    await onSubmit(fd)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Event</h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className="input-field">
            <option value="Community">Community</option>
            <option value="Business">Business</option>
            <option value="Food & Culture">Food & Culture</option>
            <option value="Sports & Recreation">Sports & Recreation</option>
            <option value="Arts & Culture">Arts & Culture</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="input-field"
            rows={3}
            placeholder="Describe the event..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g. 09:00 AM - 12:00 PM"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Venue name or address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
          <input
            type="text"
            name="organizer"
            value={formData.organizer}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Organizer name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
          <input
            type="number"
            name="maxAttendees"
            value={formData.maxAttendees}
            onChange={handleChange}
            required
            min={1}
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Image (optional)</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <ImagePlus size={18} />
              {imageFile ? 'Change image' : 'Choose image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="h-16 w-24 object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            {imageFile && !imagePreview && (
              <span className="text-sm text-gray-500">{imageFile.name}</span>
            )}
          </div>
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
              <span>Submit Event</span>
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

export default EventsPage
