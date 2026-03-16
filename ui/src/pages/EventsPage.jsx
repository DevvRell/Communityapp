import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, Search, Filter, Plus, CheckCircle } from 'lucide-react'
import { getEvents, getUpcomingEvents, addEvent, attendEvent, init } from '../services/mockStore'

init()

const CATEGORIES = [
  { value: 'all', label: 'All Events' },
  { value: 'community', label: 'Community' },
  { value: 'business', label: 'Business' },
  { value: 'food', label: 'Food & Culture' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'education', label: 'Education' },
]

const BLANK_FORM = {
  title: '', category: '', description: '', date: '',
  time: '', location: '', organizer: '', maxAttendees: '', image: '',
}

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(BLANK_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [attendedIds, setAttendedIds] = useState(new Set())
  const [, forceRender] = useState(0)
  const refresh = () => forceRender(n => n + 1)

  const events = getEvents('APPROVED', selectedCategory === 'all' ? null : selectedCategory)
  const upcomingEvents = getUpcomingEvents()

  const filteredEvents = events.filter(e => {
    if (!searchTerm.trim()) return true
    return e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           e.description.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    addEvent({ ...formData, maxAttendees: parseInt(formData.maxAttendees) || 50 })
    setSubmitting(false)
    setSuccessMsg('Your event has been submitted for review. It will appear once approved.')
    setFormData(BLANK_FORM)
    setShowForm(false)
    refresh()
  }

  const handleAttend = (id) => {
    if (attendedIds.has(id)) return
    attendEvent(id)
    setAttendedIds(prev => new Set([...prev, id]))
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay connected with your community through local events, activities, and gatherings.
          </p>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-800 font-medium">Event submitted!</p>
              <p className="text-green-700 text-sm mt-1">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-500 hover:text-green-700 text-xl leading-none">×</button>
          </div>
        )}

        {/* Search, Filter, Add Event */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field pl-10"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-gray-600">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </span>
            </div>

            <button
              onClick={() => { setShowForm(v => !v); setSuccessMsg(null) }}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Submission form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit an Event</h2>
            <p className="text-sm text-gray-500 mb-6">Events are reviewed before appearing publicly.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                  <input type="text" className="input-field" required placeholder="e.g. Summer Block Party" {...field('title')} />
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
                <textarea className="input-field" rows={3} required placeholder="Describe the event..." {...field('description')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input type="date" className="input-field" required {...field('date')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input type="text" className="input-field" required placeholder="e.g. 10:00 AM – 2:00 PM" {...field('time')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input type="text" className="input-field" required placeholder="e.g. Central Park" {...field('location')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organizer *</label>
                  <input type="text" className="input-field" required placeholder="Your name or organization" {...field('organizer')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees *</label>
                  <input type="number" min="1" className="input-field" required placeholder="e.g. 100" {...field('maxAttendees')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL <span className="text-gray-400">(optional)</span></label>
                  <input type="url" className="input-field" placeholder="https://..." {...field('image')} />
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

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const pct = Math.round((event.attendees / event.maxAttendees) * 100)
            const attended = attendedIds.has(event.id)
            const isFull = event.attendees >= event.maxAttendees
            return (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gray-200 relative">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <Calendar className="text-white" size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">{event.category}</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">{pct}% Full</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2" size={16} />{formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2" size={16} />{event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2" size={16} />{event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="mr-2" size={16} />{event.attendees}/{event.maxAttendees} attending
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm text-gray-600"><strong>Organized by:</strong> {event.organizer}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAttend(event.id)}
                      disabled={attended || isFull}
                      className={`flex-1 text-sm py-2 px-4 rounded-lg font-medium transition-colors ${
                        attended ? 'bg-green-100 text-green-700 cursor-default'
                          : isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      {attended ? '✓ Attending' : isFull ? 'Event Full' : 'Attend'}
                    </button>
                    <button className="btn-secondary text-sm">Details</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter.</p>
          </div>
        )}

        {/* Upcoming strip */}
        {upcomingEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-primary-600 font-medium mb-1">{formatDate(event.date)}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-1" size={14} />{event.time}
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
