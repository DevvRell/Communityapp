
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, Calendar, MessageSquare, ClipboardList, ArrowRight, Star, Loader2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const HomePage = () => {
  const [stats, setStats] = useState(null)
  const [featuredBusiness, setFeaturedBusiness] = useState(null)
  const [upcomingEvent, setUpcomingEvent] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stats`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        // use fallback
      }
    }

    const fetchBusiness = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/businesses`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setFeaturedBusiness(data[0])
          }
        }
      } catch {
        // use fallback
      }
    }

    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/events/upcoming`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setUpcomingEvent(data[0])
          }
        }
      } catch {
        // use fallback
      }
    }

    fetchStats()
    fetchBusiness()
    fetchEvent()
  }, [])

  const features = [
    {
      icon: Building2,
      title: 'Business Directory',
      description: 'Discover and support local businesses in your community',
      link: '/businesses'
    },
    {
      icon: Calendar,
      title: 'Community Events',
      description: 'Stay updated on local events and activities',
      link: '/events'
    },
    {
      icon: MessageSquare,
      title: 'Voice Concerns',
      description: 'Report issues and share feedback with the community',
      link: '/complaints'
    },
    {
      icon: ClipboardList,
      title: 'Committee Updates',
      description: 'Meeting minutes and agendas for community committees',
      link: '/committee-updates'
    }
  ]

  const statItems = stats
    ? [
        { label: 'Local Businesses', value: stats.businesses },
        { label: 'Upcoming Events', value: stats.upcomingEvents },
        { label: 'Complaints Filed', value: stats.complaints },
        { label: 'Issues Resolved', value: stats.resolvedComplaints }
      ]
    : [
        { label: 'Local Businesses', value: '150+' },
        { label: 'Community Events', value: '25+' },
        { label: 'Active Members', value: '2,500+' },
        { label: 'Issues Resolved', value: '95%' }
      ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Competent Community
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connecting our community through local businesses, events, and open communication.
              Together we build a stronger, more united neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/businesses" className="btn-primary text-lg px-8 py-3">
                Explore Businesses
              </Link>
              <Link to="/events" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statItems.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides everything you need to stay connected with your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Learn more <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Community Highlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Spotlight
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what's happening in our neighborhood
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Business */}
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Building2 className="text-primary-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {featuredBusiness ? featuredBusiness.name : "Joe's Coffee Shop"}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="text-yellow-400" size={14} />
                    <span className="ml-1">
                      {featuredBusiness
                        ? `${Number(featuredBusiness.rating).toFixed(1)} (${featuredBusiness.reviews} reviews)`
                        : '4.8 (120 reviews)'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                {featuredBusiness
                  ? (featuredBusiness.description || `Local ${featuredBusiness.category.toLowerCase()} business serving the East New York community.`)
                  : 'Local coffee shop serving the community with fresh brews and friendly service.'}
              </p>
              <Link to="/businesses" className="text-primary-600 hover:text-primary-700 font-medium">
                Visit Business →
              </Link>
            </div>

            {/* Upcoming Event */}
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="text-secondary-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {upcomingEvent ? upcomingEvent.title : 'Community Cleanup'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {upcomingEvent
                      ? `${formatDate(upcomingEvent.date)}, ${upcomingEvent.time}`
                      : 'This Saturday, 9 AM'}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                {upcomingEvent
                  ? upcomingEvent.description
                  : "Join us for our monthly community cleanup event. Let's keep our neighborhood beautiful!"}
              </p>
              <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium">
                View Event →
              </Link>
            </div>

            {/* Recent Resolution */}
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <MessageSquare className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Community Voice</h3>
                  <p className="text-sm text-gray-600">Report neighborhood issues</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Help keep our community safe and well-maintained by reporting issues to your local board.
              </p>
              <Link to="/complaints" className="text-primary-600 hover:text-primary-700 font-medium">
                Report Issue →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
