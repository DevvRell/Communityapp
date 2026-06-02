import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2, Calendar, MessageSquare, ClipboardList,
  ArrowRight, Star, Image as ImageIcon, Newspaper,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { fadeUp, stagger, inView } from '../lib/motion'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const HomePage = () => {
  const [stats, setStats] = useState(null)
  const [featuredBusiness, setFeaturedBusiness] = useState(null)
  const [upcomingEvent, setUpcomingEvent] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/stats`).then((r) => r.ok && r.json()).then(setStats).catch(() => {})
    fetch(`${API_BASE}/api/businesses`).then((r) => r.ok && r.json()).then((d) => {
      if (Array.isArray(d) && d.length) setFeaturedBusiness(d[0])
    }).catch(() => {})
    fetch(`${API_BASE}/api/events/upcoming`).then((r) => r.ok && r.json()).then((d) => {
      if (Array.isArray(d) && d.length) setUpcomingEvent(d[0])
    }).catch(() => {})
  }, [])

  const features = [
    { icon: Building2, title: 'Business Directory', description: 'Discover and support local businesses across the district.', link: '/businesses' },
    { icon: Calendar, title: 'Community Events', description: 'Stay updated on meetings, festivals, clean-ups, and more.', link: '/events' },
    { icon: MessageSquare, title: 'Voice Concerns', description: 'Report issues and track them through to resolution.', link: '/complaints' },
    { icon: ClipboardList, title: 'Committee Updates', description: 'Meeting minutes, agendas, and motions from every committee.', link: '/committee-updates' },
    { icon: Newspaper, title: 'Daily Report', description: 'Weather, transit, news — a snapshot of the day in the district.', link: '/daily-report' },
    { icon: ImageIcon, title: 'Photo Gallery', description: 'A living archive of the people and places that define the neighborhood.', link: '/gallery' },
  ]

  const statItems = stats
    ? [
        { label: 'Local Businesses', value: stats.businesses },
        { label: 'Upcoming Events', value: stats.upcomingEvents },
        { label: 'Complaints Filed', value: stats.complaints },
        { label: 'Issues Resolved', value: stats.resolvedComplaints },
      ]
    : [
        { label: 'Local Businesses', value: '150+' },
        { label: 'Community Events', value: '25+' },
        { label: 'Active Members', value: '2,500+' },
        { label: 'Issues Resolved', value: '95%' },
      ]

  const formatDate = (s) => new Date(s).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Brooklyn Community Board 5"
        title={<>The neighborhood, <em className="text-gold-300">connected.</em></>}
        subtitle="Local businesses, community events, committee updates, and the issues that shape your block — under one roof."
        size="lg"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/businesses">
            <Button variant="primary" iconRight={ArrowRight}>Explore Businesses</Button>
          </Link>
          <Link to="/events">
            <Button variant="ghost" className="!bg-cream-50/10 !text-cream-50 !border-cream-100/20 hover:!bg-cream-50/20">
              View Events
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Stats strip */}
      <motion.section
        {...inView}
        variants={stagger(0.08)}
        className="bg-cream-50 border-b border-forest-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statItems.map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <div className="font-display text-4xl md:text-5xl text-forest-800 mb-1 tabular-nums tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-forest-600 uppercase tracking-[0.12em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        {...inView}
        variants={stagger(0.06)}
        className="py-20 bg-cream-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="inline-block px-3 py-1 mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] bg-gold-100 text-gold-800 border border-gold-200 rounded-full">
              What we offer
            </span>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-forest-900 leading-[1.05]">
              Everything you need to stay <em className="text-gold-600">connected</em>.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group bg-white rounded-2xl border border-forest-100 hover:border-gold-300 hover:shadow-lg hover:shadow-forest-900/5 p-6 transition-all duration-250 ease-brand hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-forest-700 to-forest-600 rounded-xl mb-4 shadow-md shadow-forest-900/20">
                    <Icon className="text-gold-300" size={22} />
                  </div>
                  <h3 className="font-display text-2xl text-forest-900 mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-forest-700/80 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link
                    to={feature.link}
                    className="inline-flex items-center gap-1.5 text-gold-700 hover:text-gold-600 font-semibold text-sm transition-colors"
                  >
                    Learn more <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Spotlight */}
      <motion.section
        {...inView}
        variants={stagger(0.06)}
        className="py-20 bg-white border-t border-forest-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="inline-block px-3 py-1 mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
              Community spotlight
            </span>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-forest-900 leading-[1.05]">
              See what's happening <em className="text-gold-600">on the block</em>.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Featured Business */}
            <motion.div variants={fadeUp} className="bg-cream-50 rounded-2xl border border-forest-100 hover:border-gold-300 transition-all p-6">
              <div className="flex items-center mb-4 gap-3">
                <div className="w-12 h-12 bg-forest-700 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="text-gold-300" size={20} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-forest-900 leading-tight">
                    {featuredBusiness ? featuredBusiness.name : "Joe's Coffee Shop"}
                  </h3>
                  <div className="flex items-center text-sm text-forest-600 gap-1">
                    <Star className="text-gold-500 fill-gold-500" size={13} />
                    <span>
                      {featuredBusiness
                        ? `${Number(featuredBusiness.rating).toFixed(1)} (${featuredBusiness.reviews} reviews)`
                        : '4.8 (120 reviews)'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-forest-700/80 mb-4 leading-relaxed text-sm">
                {featuredBusiness
                  ? (featuredBusiness.description || `Local ${featuredBusiness.category.toLowerCase()} business serving the East New York community.`)
                  : 'Local coffee shop serving the community with fresh brews and friendly service.'}
              </p>
              <Link to="/businesses" className="inline-flex items-center gap-1.5 text-gold-700 hover:text-gold-600 font-semibold text-sm">
                Visit business <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Upcoming Event */}
            <motion.div variants={fadeUp} className="bg-cream-50 rounded-2xl border border-forest-100 hover:border-gold-300 transition-all p-6">
              <div className="flex items-center mb-4 gap-3">
                <div className="w-12 h-12 bg-forest-700 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="text-gold-300" size={20} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-forest-900 leading-tight">
                    {upcomingEvent ? upcomingEvent.title : 'Community Cleanup'}
                  </h3>
                  <p className="text-sm text-forest-600">
                    {upcomingEvent
                      ? `${formatDate(upcomingEvent.date)}, ${upcomingEvent.time}`
                      : 'This Saturday, 9 AM'}
                  </p>
                </div>
              </div>
              <p className="text-forest-700/80 mb-4 leading-relaxed text-sm">
                {upcomingEvent
                  ? upcomingEvent.description
                  : "Join us for our monthly community cleanup. Let's keep our neighborhood beautiful."}
              </p>
              <Link to="/events" className="inline-flex items-center gap-1.5 text-gold-700 hover:text-gold-600 font-semibold text-sm">
                View event <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Community Voice */}
            <motion.div variants={fadeUp} className="bg-cream-50 rounded-2xl border border-forest-100 hover:border-gold-300 transition-all p-6">
              <div className="flex items-center mb-4 gap-3">
                <div className="w-12 h-12 bg-forest-700 rounded-xl flex items-center justify-center shadow-md">
                  <MessageSquare className="text-gold-300" size={20} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-forest-900 leading-tight">Community Voice</h3>
                  <p className="text-sm text-forest-600">Report neighborhood issues</p>
                </div>
              </div>
              <p className="text-forest-700/80 mb-4 leading-relaxed text-sm">
                Help keep our community safe and well-maintained by reporting issues to your local board.
              </p>
              <Link to="/complaints" className="inline-flex items-center gap-1.5 text-gold-700 hover:text-gold-600 font-semibold text-sm">
                Report issue <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default HomePage
