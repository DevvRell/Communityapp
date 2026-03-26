/**
 * mockStore.js
 * localStorage-backed data store for dev/mock environment.
 * All public views show APPROVED items only.
 * User submissions land as PENDING and appear in the admin panel.
 * Admin can approve → item becomes visible, or reject → hidden.
 */

const KEYS = {
  businesses: 'cb5_mock_businesses',
  events:     'cb5_mock_events',
  complaints: 'cb5_mock_complaints',
  photos:     'cb5_mock_photos',
  nextId:     'cb5_mock_next_id',
  seeded:     'cb5_mock_seeded',
}

export const STATUS = {
  PENDING:  'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

// ---------------------------------------------------------------------------
// Seed data — original mock content, all pre-approved
// ---------------------------------------------------------------------------

const SEED_BUSINESSES = [
  { id: 1, name: 'Green Valley Café', category: 'restaurant', description: 'Cozy neighborhood café serving breakfast, lunch, and fresh pastries. Locally sourced ingredients.', address: '124 Main Street', phone: '(555) 123-4567', email: 'hello@greenvalleycafe.com', rating: 4.6, reviews: 128, hours: 'Mon–Fri 7am–4pm, Sat–Sun 8am–3pm', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Downtown Hardware', category: 'retail', description: 'Family-owned hardware store with tools, paint, and home improvement supplies for over 30 years.', address: '45 Oak Avenue', phone: '(555) 234-5678', email: 'info@downtownhardware.com', rating: 4.8, reviews: 89, hours: 'Mon–Sat 8am–6pm', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'Riverside Dental', category: 'health', description: 'Full-service dental care for the whole family. Cleanings, orthodontics, and emergency care.', address: '200 River Road, Suite 101', phone: '(555) 345-6789', email: 'appointments@riversidedental.com', rating: 4.9, reviews: 204, hours: 'Mon–Thu 8am–6pm, Fri 8am–2pm', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 4, name: 'Tech Solutions LLC', category: 'technology', description: 'Computer repair, IT support, and smart home setup. We come to you.', address: '88 Commerce Drive', phone: '(555) 456-7890', email: 'support@techsolutions.com', rating: 4.7, reviews: 56, hours: 'Mon–Fri 9am–5pm', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 5, name: 'Sunset Pizza', category: 'restaurant', description: 'Wood-fired pizzas, pasta, and salads. Dine-in or takeout. Family-friendly.', address: '312 Elm Street', phone: '(555) 567-8901', email: 'order@sunsetpizza.com', rating: 4.5, reviews: 312, hours: 'Tue–Sun 11am–10pm', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 6, name: 'Community Fitness', category: 'services', description: 'Gym, classes, and personal training. Day passes and memberships available.', address: '500 Park Lane', phone: '(555) 678-9012', email: 'info@communityfitness.com', rating: 4.4, reviews: 167, hours: 'Mon–Fri 5am–10pm, Sat–Sun 7am–8pm', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 7, name: 'Village Bookshop', category: 'retail', description: 'Independent bookstore with new and used books, gifts, and a reading nook.', address: '22 Center Street', phone: '(555) 789-0123', email: 'books@villagebookshop.com', rating: 4.9, reviews: 98, hours: 'Mon–Sat 10am–6pm', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
]

const SEED_EVENTS = [
  { id: 1, title: 'Community Cleanup Day', category: 'community', description: "Join us for our monthly community cleanup event. Let's keep our neighborhood beautiful!", date: '2024-02-15', time: '09:00 AM - 12:00 PM', location: 'Central Park, Main Entrance', organizer: 'Neighborhood Association', attendees: 45, maxAttendees: 100, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Local Business Networking', category: 'business', description: 'Monthly networking event for local business owners to connect and collaborate.', date: '2024-02-20', time: '06:00 PM - 08:00 PM', location: 'Community Center, Conference Room A', organizer: 'Business Development Group', attendees: 28, maxAttendees: 50, image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 3, title: 'Farmers Market', category: 'food', description: 'Weekly farmers market featuring local produce, artisanal goods, and live music.', date: '2024-02-17', time: '10:00 AM - 04:00 PM', location: 'Downtown Plaza', organizer: 'Local Farmers Cooperative', attendees: 120, maxAttendees: 200, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 4, title: 'Youth Basketball Tournament', category: 'sports', description: 'Annual basketball tournament for youth ages 12-18. Registration required.', date: '2024-02-24', time: '09:00 AM - 06:00 PM', location: 'Community Gymnasium', organizer: 'Youth Sports League', attendees: 64, maxAttendees: 80, image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=200&fit=crop', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 5, title: 'Art Exhibition Opening', category: 'arts', description: 'Opening night for the local artists exhibition featuring works from community members.', date: '2024-02-22', time: '07:00 PM - 09:00 PM', location: 'Community Art Gallery', organizer: 'Local Artists Collective', attendees: 35, maxAttendees: 60, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 6, title: 'Emergency Preparedness Workshop', category: 'education', description: 'Learn essential emergency preparedness skills and create a family emergency plan.', date: '2024-02-18', time: '02:00 PM - 04:00 PM', location: 'Fire Station #3, Training Room', organizer: 'Emergency Services Department', attendees: 22, maxAttendees: 40, image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop', submissionStatus: 'APPROVED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
]

const SEED_COMPLAINTS = [
  { id: 1, title: 'Pothole on Oak Street', description: 'Large pothole near the intersection of Oak and Main. Several cars have been damaged.', category: 'Roads & Sidewalks', location: 'Oak Street & Main', status: 'in-progress', priority: 'high', submittedBy: 'Jane Doe', submittedDate: '2024-02-01T10:00:00Z', resolvedDate: null, response: 'Our crew has been assigned. Repairs scheduled for next week.', submissionStatus: 'APPROVED', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-02-01T10:00:00Z' },
  { id: 2, title: 'Streetlight out on Park Lane', description: 'The streetlight at 500 Park Lane has been dark for two weeks. Safety concern at night.', category: 'Infrastructure', location: '500 Park Lane', status: 'pending', priority: 'medium', submittedBy: 'John Smith', submittedDate: '2024-02-10T14:30:00Z', resolvedDate: null, response: null, submissionStatus: 'APPROVED', createdAt: '2024-02-10T14:30:00Z', updatedAt: '2024-02-10T14:30:00Z' },
  { id: 3, title: 'Noise from construction after hours', description: 'Construction on Commerce Drive continues past 7 PM on weekdays. Very disruptive.', category: 'Noise', location: 'Commerce Drive', status: 'resolved', priority: 'medium', submittedBy: 'Maria Garcia', submittedDate: '2024-01-15T09:00:00Z', resolvedDate: '2024-01-22T00:00:00Z', response: 'Spoke with contractor. They will adhere to 6 PM cutoff. Thank you for reporting.', submissionStatus: 'APPROVED', createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-22T00:00:00Z' },
  { id: 4, title: 'Overflowing recycling bins', description: 'Recycling bins at the corner of Elm and 5th have been overflowing for days.', category: 'Sanitation', location: 'Elm Street & 5th Avenue', status: 'resolved', priority: 'low', submittedBy: 'Robert Lee', submittedDate: '2024-02-05T11:00:00Z', resolvedDate: '2024-02-07T00:00:00Z', response: 'Bins have been emptied and pickup schedule verified. Thanks for letting us know.', submissionStatus: 'APPROVED', createdAt: '2024-02-05T11:00:00Z', updatedAt: '2024-02-07T00:00:00Z' },
  { id: 5, title: 'Broken swing in Riverside Park', description: 'One of the swings in the playground is broken and could be dangerous for kids.', category: 'Parks & Recreation', location: 'Riverside Park playground', status: 'pending', priority: 'high', submittedBy: 'Sarah Chen', submittedDate: '2024-02-12T16:00:00Z', resolvedDate: null, response: null, submissionStatus: 'APPROVED', createdAt: '2024-02-12T16:00:00Z', updatedAt: '2024-02-12T16:00:00Z' },
]

const SEED_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', originalName: 'park_trail.jpg', submittedBy: 'Admin', submissionStatus: 'APPROVED', createdAt: '2024-02-10T12:00:00Z', updatedAt: '2024-02-10T12:00:00Z' },
  { id: 2, url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop', originalName: 'community_garden.jpg', submittedBy: 'Admin', submissionStatus: 'APPROVED', createdAt: '2024-02-09T09:00:00Z', updatedAt: '2024-02-09T09:00:00Z' },
  { id: 3, url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop', originalName: 'downtown.jpg', submittedBy: 'Admin', submissionStatus: 'APPROVED', createdAt: '2024-02-08T14:00:00Z', updatedAt: '2024-02-08T14:00:00Z' },
  { id: 4, url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop', originalName: 'city_view.jpg', submittedBy: 'Admin', submissionStatus: 'APPROVED', createdAt: '2024-02-07T11:00:00Z', updatedAt: '2024-02-07T11:00:00Z' },
]

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function nextId() {
  const current = read(KEYS.nextId) || 100
  const id = current + 1
  write(KEYS.nextId, id)
  return id
}

// ---------------------------------------------------------------------------
// Initialization — seeds data on first load, idempotent after that
// ---------------------------------------------------------------------------

export function init() {
  if (localStorage.getItem(KEYS.seeded)) return
  write(KEYS.businesses, SEED_BUSINESSES)
  write(KEYS.events, SEED_EVENTS)
  write(KEYS.complaints, SEED_COMPLAINTS)
  write(KEYS.photos, SEED_PHOTOS)
  write(KEYS.nextId, 100)
  localStorage.setItem(KEYS.seeded, '1')
}

// ---------------------------------------------------------------------------
// Businesses
// ---------------------------------------------------------------------------

export function getBusinesses(status = STATUS.APPROVED) {
  init()
  const all = read(KEYS.businesses) || []
  if (status === 'all') return all
  return all.filter(b => b.submissionStatus === status)
}

export function searchBusinesses(query) {
  const q = query.toLowerCase()
  return getBusinesses(STATUS.APPROVED).filter(b =>
    b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
  )
}

export function addBusiness(data) {
  init()
  const all = read(KEYS.businesses) || []
  const item = {
    ...data,
    id: nextId(),
    rating: 0,
    reviews: 0,
    submissionStatus: STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  write(KEYS.businesses, [...all, item])
  return item
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function getEvents(status = STATUS.APPROVED, category) {
  init()
  const all = read(KEYS.events) || []
  return all.filter(e => {
    const matchStatus = status === 'all' || e.submissionStatus === status
    const matchCat = !category || category === 'all' || e.category === category
    return matchStatus && matchCat
  })
}

export function getUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0]
  return getEvents(STATUS.APPROVED)
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10)
}

export function addEvent(data) {
  init()
  const all = read(KEYS.events) || []
  const item = {
    ...data,
    id: nextId(),
    attendees: 0,
    submissionStatus: STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  write(KEYS.events, [...all, item])
  return item
}

export function attendEvent(id) {
  const all = read(KEYS.events) || []
  const updated = all.map(e => {
    if (e.id === id) {
      if (e.attendees >= e.maxAttendees) return e
      return { ...e, attendees: e.attendees + 1, updatedAt: new Date().toISOString() }
    }
    return e
  })
  write(KEYS.events, updated)
  return updated.find(e => e.id === id)
}

// ---------------------------------------------------------------------------
// Complaints
// ---------------------------------------------------------------------------

export function getComplaints({ status, submissionStatus = STATUS.APPROVED } = {}) {
  init()
  const all = read(KEYS.complaints) || []
  return all.filter(c => {
    const matchSub = submissionStatus === 'all' || c.submissionStatus === submissionStatus
    const matchStatus = !status || status === 'all' || c.status === status
    return matchSub && matchStatus
  })
}

export function addComplaint(data) {
  init()
  const all = read(KEYS.complaints) || []
  const item = {
    ...data,
    id: nextId(),
    status: 'pending',
    resolvedDate: null,
    response: null,
    submissionStatus: STATUS.PENDING,
    submittedDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  write(KEYS.complaints, [...all, item])
  return item
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export function getPhotos(status = STATUS.APPROVED) {
  init()
  const all = read(KEYS.photos) || []
  if (status === 'all') return all
  return all.filter(p => p.submissionStatus === status)
}

export function addPhoto(data) {
  init()
  const all = read(KEYS.photos) || []
  const item = {
    ...data,
    id: nextId(),
    submissionStatus: STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  try {
    write(KEYS.photos, [...all, item])
  } catch {
    // localStorage quota exceeded (large image data URLs)
    throw new Error('Image too large to store locally. Try a smaller file.')
  }
  return item
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

const TYPE_TO_KEY = {
  business:  'businesses',
  event:     'events',
  complaint: 'complaints',
  photo:     'photos',
}

export function getSubmissions(type = 'all', status = 'pending') {
  init()
  const targetStatus = status.toUpperCase()
  const types = type === 'all'
    ? ['business', 'event', 'complaint', 'photo']
    : [type]

  const results = []
  types.forEach(t => {
    const all = read(KEYS[TYPE_TO_KEY[t]]) || []
    all
      .filter(item => item.submissionStatus === targetStatus)
      .forEach(item => results.push({ type: t, id: item.id, submissionStatus: item.submissionStatus, data: item }))
  })
  return results
}

export function approveSubmission(type, id) {
  const key = KEYS[TYPE_TO_KEY[type]]
  const all = read(key) || []
  write(key, all.map(item =>
    item.id === id ? { ...item, submissionStatus: STATUS.APPROVED, updatedAt: new Date().toISOString() } : item
  ))
}

export function rejectSubmission(type, id) {
  const key = KEYS[TYPE_TO_KEY[type]]
  const all = read(key) || []
  write(key, all.map(item =>
    item.id === id ? { ...item, submissionStatus: STATUS.REJECTED, updatedAt: new Date().toISOString() } : item
  ))
}

// ---------------------------------------------------------------------------
// Dev utility — wipe and re-seed
// ---------------------------------------------------------------------------

export function resetStore() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  init()
}
