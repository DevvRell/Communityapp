import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  MessageSquare,
  ClipboardList,
  Image as ImageIcon,
  Newspaper,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Sparkles,
  Trophy,
  Rocket,
  MapPin,
  Bell,
  Send,
  Lightbulb,
} from 'lucide-react'
import { fadeUp, stagger, inView, slideInRight } from '../lib/motion'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Optional brand assets — drop into ui/public/
//   /landing-bg.mp4   → autoplaying muted/looped video background
//   /landing-bg.jpg   → still image background
//   /logo.png         → header logo (replaces the "CB5" placeholder)
const BG_VIDEO = '/landing-bg.mp4'
const BG_IMAGE = '/landing-bg.jpg'
const LOGO = '/logo.png'

const liveFeatures = [
  {
    icon: Building2,
    title: 'Local Business Directory',
    blurb: 'Find every business in the neighborhood — restaurants, services, shops — in one searchable map.',
    span: 'hero',     // 3×2 — top-left hero tile
    accent: 'gold',
  },
  {
    icon: Calendar,
    title: 'Community Events',
    blurb: 'RSVP to meetings, clean-ups, festivals. Never miss what is happening on your block.',
    span: 'tall',     // 3×2 — top-right tall tile
    accent: 'forest',
  },
  {
    icon: MessageSquare,
    title: 'Report Concerns',
    blurb: 'File complaints and track them to resolution.',
    span: 'small',
  },
  {
    icon: Newspaper,
    title: 'Daily Community Report',
    blurb: 'A daily snapshot of what is happening across the district.',
    span: 'small',
  },
  {
    icon: ImageIcon,
    title: 'Photo Gallery',
    blurb: 'A living archive of the neighborhood by the neighborhood.',
    span: 'small',
  },
  {
    icon: ClipboardList,
    title: 'Committee Updates',
    blurb: 'Read meeting minutes, agendas, motions, and resolutions from every committee — searchable and bookmarkable.',
    span: 'wide',     // full-width bottom tile
  },
]

// Upcoming features / roadmap timeline
const roadmap = [
  {
    status: 'Building',
    badge: 'building',
    icon: Trophy,
    title: 'Neighbor Points & Badges',
    description:
      'Earn points for showing up — attending events, helping resolve complaints, contributing photos. Unlock badges that show your impact in the community.',
  },
  {
    status: 'Building',
    badge: 'building',
    icon: MapPin,
    title: 'Live Neighborhood Map',
    description:
      'See businesses, events, complaint hotspots, and resources on an interactive map of the district.',
  },
  {
    status: 'Planned',
    badge: 'planned',
    icon: Bell,
    title: 'Block-Level Alerts',
    description:
      'Push notifications when something happens on your block — power outages, road closures, safety alerts, new events nearby.',
  },
  {
    status: 'Planned',
    badge: 'planned',
    icon: Sparkles,
    title: 'Trusted Org Profiles',
    description:
      "Churches, nonprofits, schools, and block associations get verified profiles they self-manage. One source of truth for who's doing what.",
  },
  {
    status: 'Researching',
    badge: 'researching',
    icon: Rocket,
    title: 'Civic Quests',
    description:
      'Weekly community challenges — clean a block, attend a hearing, mentor a teen — completed quests unlock perks at local businesses.',
  },
  {
    status: 'Researching',
    badge: 'researching',
    icon: MessageSquare,
    title: 'Resident-to-Board Chat',
    description:
      'Direct line to your district manager and committee chairs. No more email black holes.',
  },
]

const badgeStyles = {
  building: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  planned: 'bg-gold-500/15 text-gold-200 border-gold-400/30',
  researching: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
}

const feedbackCategories = [
  { value: 'feature_request', label: 'Feature request' },
  { value: 'gamification', label: 'Gamification idea' },
  { value: 'design', label: 'Design / UX' },
  { value: 'bug', label: 'Bug or problem' },
  { value: 'content', label: 'Content / data' },
  { value: 'general', label: 'General thought' },
]

const LandingPage = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const [fbCategory, setFbCategory] = useState('feature_request')
  const [fbMessage, setFbMessage] = useState('')
  const [fbEmail, setFbEmail] = useState('')
  const [fbStatus, setFbStatus] = useState('idle')
  const [fbResponse, setFbResponse] = useState('')

  const [hasVideo, setHasVideo] = useState(false)
  const [hasImage, setHasImage] = useState(false)
  const [hasLogo, setHasLogo] = useState(false)
  const [count, setCount] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    fetch(BG_VIDEO, { method: 'HEAD' }).then((r) => setHasVideo(r.ok)).catch(() => {})
    fetch(BG_IMAGE, { method: 'HEAD' }).then((r) => setHasImage(r.ok)).catch(() => {})
    fetch(LOGO, { method: 'HEAD' }).then((r) => setHasLogo(r.ok)).catch(() => {})

    fetch(`${API_BASE}/api/subscribe/count`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && typeof d.count === 'number' && setCount(d.count))
      .catch(() => {})
  }, [])

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setMessage('')

    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
      setMessage(data.message || "You're on the list!")
      setEmail('')
      if (count !== null) setCount(count + 1)
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  const handleFeedback = async (e) => {
    e.preventDefault()
    if (fbStatus === 'submitting') return
    setFbStatus('submitting')
    setFbResponse('')

    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fbMessage,
          email: fbEmail || undefined,
          category: fbCategory,
          source: 'landing',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFbStatus('error')
        setFbResponse(data.error || 'Could not send your feedback. Please try again.')
        return
      }
      setFbStatus('success')
      setFbResponse(data.message || 'Thanks!')
      setFbMessage('')
      setFbEmail('')
    } catch {
      setFbStatus('error')
      setFbResponse('Network error. Please try again.')
    }
  }

  const Logo = () =>
    hasLogo ? (
      <img src={LOGO} alt="CB 5 Connect" className="w-12 h-12 object-contain" />
    ) : (
      <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-gold-500 rounded-lg flex items-center justify-center shadow-lg">
        <span className="text-cream-50 font-bold text-[11px] tracking-tight">CB5</span>
      </div>
    )

  // Feature card with span-driven layout
  const FeatureTile = ({ feature, index }) => {
    const Icon = feature.icon
    const spanClasses =
      feature.span === 'hero'
        ? 'lg:col-span-3 lg:row-span-2 min-h-[280px] lg:min-h-[420px]'
        : feature.span === 'tall'
        ? 'lg:col-span-3 lg:row-span-2 min-h-[280px] lg:min-h-[420px]'
        : feature.span === 'wide'
        ? 'lg:col-span-6'
        : 'lg:col-span-2'

    const isHero = feature.span === 'hero'
    const isTall = feature.span === 'tall'
    const isWide = feature.span === 'wide'

    return (
      <motion.div
        variants={fadeUp}
        className={`group relative overflow-hidden rounded-3xl border border-cream-100/10 bg-forest-900/40 backdrop-blur-md p-7 hover:border-gold-400/40 transition-all duration-400 ease-brand hover:bg-forest-900/60 ${spanClasses}`}
      >
        {/* Subtle gradient bloom on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute -top-20 -right-20 w-64 h-64 ${isHero ? 'bg-gold-500/20' : isTall ? 'bg-forest-400/20' : 'bg-gold-500/10'} rounded-full blur-3xl`} />
        </div>

        <div className="relative h-full flex flex-col">
          <div
            className={`flex items-center justify-center mb-5 rounded-xl shadow-lg ${
              isHero
                ? 'w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 shadow-gold-900/40'
                : isTall
                ? 'w-14 h-14 bg-gradient-to-br from-forest-500 to-forest-700 shadow-forest-950/40 border border-cream-100/10'
                : 'w-11 h-11 bg-forest-800/80 border border-cream-100/10'
            }`}
          >
            <Icon size={isHero || isTall ? 26 : 20} className={isHero ? 'text-forest-900' : 'text-gold-300'} />
          </div>

          <h3
            className={`font-display tracking-tight text-cream-50 mb-3 ${
              isHero ? 'text-3xl sm:text-4xl' : isTall ? 'text-2xl sm:text-3xl' : isWide ? 'text-2xl' : 'text-xl'
            }`}
          >
            {feature.title}
          </h3>

          <p className={`text-cream-100/70 leading-relaxed ${isHero || isTall ? 'text-base' : 'text-sm'}`}>
            {feature.blurb}
          </p>

          {(isHero || isTall) && (
            <div className="mt-auto pt-6 flex items-center gap-1.5 text-sm text-gold-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Coming with launch <ArrowRight size={14} />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative min-h-screen text-cream-50 overflow-hidden bg-forest-950">
      {/* Background layer */}
      <div className="absolute inset-0 -z-10">
        {hasVideo ? (
          <video ref={videoRef} autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={BG_VIDEO} type="video/mp4" />
          </video>
        ) : hasImage ? (
          <img src={BG_IMAGE} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-forest-950 via-forest-800 to-forest-700 animate-gradient" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/85 via-forest-900/65 to-forest-950/95" />
        {/* Brand radial blooms */}
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-gold-500/12 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-[28rem] h-[28rem] bg-gold-400/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] bg-forest-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-2xl tracking-tight text-cream-50 leading-none">
              <em className="not-italic text-gold-300">Connect</em>
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-cream-100/80">
            <a href="#features" className="hover:text-gold-300 transition-colors">Features</a>
            <a href="#roadmap" className="hover:text-gold-300 transition-colors">Roadmap</a>
            <a href="#feedback" className="hover:text-gold-300 transition-colors">Feedback</a>
            <a href="#signup" className="inline-flex items-center gap-1.5 text-gold-300">
              Get early access <ArrowRight size={14} />
            </a>
          </nav>
        </div>
      </motion.header>

      {/* Hero — asymmetric (display copy left, signup card right) */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-10 pb-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block px-3 py-1 mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] bg-gold-500/15 text-gold-200 border border-gold-400/30 rounded-full backdrop-blur-sm"
            >
              Launching soon · Brooklyn CB5
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl md:text-7xl xl:text-[5.5rem] leading-[0.95] tracking-tight mb-6 text-cream-50"
            >
              The neighborhood,{' '}
              <em className="not-italic">
                <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-cream-100 bg-clip-text text-transparent italic">
                  reimagined.
                </span>
              </em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-cream-100/80 max-w-2xl leading-relaxed mb-8"
            >
              CB 5 Connect is a single home for local businesses, community events,
              committee updates, and the issues that matter on your block —
              designed to make showing up <em className="font-display text-gold-200 not-italic">rewarding</em>.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-3 text-sm text-cream-100/60">
              <div className="flex -space-x-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 border-2 border-forest-950" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-forest-300 to-forest-500 border-2 border-forest-950" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cream-200 to-cream-400 border-2 border-forest-950" />
              </div>
              <span>
                {count !== null && count > 0
                  ? `${count.toLocaleString()} neighbor${count === 1 ? '' : 's'} already signed up.`
                  : 'Be among the first neighbors to join.'}
              </span>
            </motion.div>
          </motion.div>

          {/* Signup card */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            id="signup"
            className="lg:col-span-5"
          >
            <div className="relative bg-forest-900/60 backdrop-blur-xl border border-cream-100/15 rounded-3xl p-7 shadow-2xl shadow-forest-950/60 overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2 text-gold-300 mb-3">
                  <Sparkles size={16} />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Get early access</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl text-cream-50 mb-1.5 leading-tight">
                  Be the first to know when we go live.
                </h2>
                <p className="text-sm text-cream-100/65 mb-6">
                  We'll send one note when CB 5 Connect opens up — no spam, no newsletter you didn't ask for.
                </p>

                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/50" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@neighborhood.com"
                      disabled={status === 'submitting' || status === 'success'}
                      className="w-full bg-forest-950/40 border border-cream-100/15 rounded-xl pl-10 pr-3 py-3 text-cream-50 placeholder-cream-100/40 focus:outline-none focus:border-gold-400/60 focus:bg-forest-950/60 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'submitting' || status === 'success'}
                    className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-gold-500/60 text-forest-900 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40 hover:-translate-y-0.5"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Joining
                      </>
                    ) : status === 'success' ? (
                      <>
                        <CheckCircle2 size={16} /> You're on the list
                      </>
                    ) : (
                      <>
                        Reserve my spot <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                  {message && (
                    <p className={`text-sm ${status === 'error' ? 'text-rose-300' : 'text-gold-200'}`}>
                      {message}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section divider */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-cream-100/15 to-transparent" />
      </div>

      {/* Features — BENTO grid */}
      <motion.section
        {...inView}
        variants={stagger(0.08)}
        id="features"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="inline-block px-3 py-1 mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 rounded-full">
                Live at launch
              </span>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-cream-50 leading-[1.05] max-w-3xl">
                Everything the neighborhood needs,{' '}
                <em className="text-gold-300">in one place.</em>
              </h2>
            </div>
            <p className="text-cream-100/65 max-w-sm md:text-right">
              Six tools that replace the dozen tabs you have open trying to keep up with the block.
            </p>
          </motion.div>

          {/* Bento: 6-col grid on lg, with varied tile spans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-fr">
            {liveFeatures.map((f, i) => (
              <FeatureTile key={i} feature={f} index={i} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section divider */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-cream-100/15 to-transparent" />
      </div>

      {/* Roadmap — vertical timeline */}
      <motion.section
        {...inView}
        variants={stagger(0.1)}
        id="roadmap"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="inline-block px-3 py-1 mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] bg-gold-500/15 text-gold-200 border border-gold-400/30 rounded-full">
              What's next
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-cream-50 leading-[1.05] mb-4">
              The roadmap is{' '}
              <em className="text-gold-300">yours to shape.</em>
            </h2>
            <p className="text-cream-100/70 max-w-2xl mx-auto">
              We're building CB 5 Connect <em className="font-display text-gold-200 not-italic">with</em> the
              neighborhood, not for it. Here's what's coming. Spot something missing? Tell us below.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical rail */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cream-100/20 to-transparent sm:-translate-x-px" />

            <div className="space-y-8 sm:space-y-12">
              {roadmap.map((item, i) => {
                const Icon = item.icon
                const isLeft = i % 2 === 0
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-12 ${isLeft ? '' : ''}`}
                  >
                    {/* Node */}
                    <div className="absolute left-4 sm:left-1/2 top-6 -translate-x-1/2 z-10">
                      <div className="w-3 h-3 bg-gold-400 rounded-full ring-4 ring-forest-950 shadow-lg shadow-gold-500/50" />
                    </div>

                    {/* Card — alternates side on sm+ */}
                    <div
                      className={`bg-forest-900/50 backdrop-blur-md border border-cream-100/10 rounded-2xl p-6 hover:bg-forest-900/70 hover:border-gold-400/30 transition-all duration-400 ease-brand ${
                        isLeft ? 'sm:col-start-1' : 'sm:col-start-2'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-forest-800/80 border border-cream-100/10 flex items-center justify-center shrink-0">
                          <Icon size={20} className="text-gold-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-display text-2xl text-cream-50 leading-tight">
                              {item.title}
                            </h3>
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-[0.16em] px-2 py-0.5 rounded-full border ${
                                badgeStyles[item.badge]
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-cream-100/70 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section divider */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-cream-100/15 to-transparent" />
      </div>

      {/* Feedback — split layout */}
      <motion.section
        {...inView}
        variants={stagger(0.08)}
        id="feedback"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <motion.div variants={fadeUp} className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-900/40 mb-5">
              <Lightbulb size={22} className="text-forest-900" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-cream-50 leading-[1.05] mb-5">
              Got an idea?{' '}
              <em className="text-gold-300">Send it.</em>
            </h2>
            <p className="text-cream-100/70 text-lg leading-relaxed mb-4">
              Feature requests, gamification ideas, design notes, bug reports —
              everything gets read. The best ones ship.
            </p>
            <p className="text-sm text-cream-100/50">
              No account required. We respond to every email you leave.
            </p>
          </motion.div>

          <motion.form
            variants={fadeUp}
            onSubmit={handleFeedback}
            className="lg:col-span-7 bg-forest-900/50 backdrop-blur-md border border-cream-100/10 rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-100/60 mb-2">
                  Topic
                </span>
                <select
                  value={fbCategory}
                  onChange={(e) => setFbCategory(e.target.value)}
                  className="w-full bg-forest-950/40 border border-cream-100/15 rounded-xl px-3 py-3 text-cream-50 focus:outline-none focus:border-gold-400/60 focus:bg-forest-950/60 transition-all"
                >
                  {feedbackCategories.map((c) => (
                    <option key={c.value} value={c.value} className="bg-forest-900">
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-100/60 mb-2">
                  Email (optional)
                </span>
                <input
                  type="email"
                  value={fbEmail}
                  onChange={(e) => setFbEmail(e.target.value)}
                  placeholder="So we can follow up"
                  className="w-full bg-forest-950/40 border border-cream-100/15 rounded-xl px-3 py-3 text-cream-50 placeholder-cream-100/40 focus:outline-none focus:border-gold-400/60 focus:bg-forest-950/60 transition-all"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-100/60 mb-2">
                Your idea
              </span>
              <textarea
                required
                minLength={4}
                maxLength={2000}
                rows={6}
                value={fbMessage}
                onChange={(e) => setFbMessage(e.target.value)}
                placeholder="What should we build? What's missing? What would make you actually use this every week?"
                className="w-full bg-forest-950/40 border border-cream-100/15 rounded-xl px-3 py-3 text-cream-50 placeholder-cream-100/40 focus:outline-none focus:border-gold-400/60 focus:bg-forest-950/60 transition-all resize-y"
              />
              <div className="flex justify-end mt-1.5">
                <span className="text-[11px] text-cream-100/40 tabular-nums">
                  {fbMessage.length}/2000
                </span>
              </div>
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs text-cream-100/40">
                We read every submission within 48 hours.
              </p>
              <button
                type="submit"
                disabled={fbStatus === 'submitting' || fbStatus === 'success'}
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-forest-900 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40 hover:-translate-y-0.5"
              >
                {fbStatus === 'submitting' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending
                  </>
                ) : fbStatus === 'success' ? (
                  <>
                    <CheckCircle2 size={16} /> Sent
                  </>
                ) : (
                  <>
                    Send feedback <Send size={16} />
                  </>
                )}
              </button>
            </div>
            {fbResponse && (
              <p className={`text-sm ${fbStatus === 'error' ? 'text-rose-300' : 'text-gold-200'}`}>
                {fbResponse}
              </p>
            )}
          </motion.form>
        </div>
      </motion.section>

      {/* Closing CTA */}
      <motion.section
        {...inView}
        variants={fadeUp}
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-5xl tracking-tight text-cream-50 leading-tight mb-5">
            Built for the people who{' '}
            <em className="text-gold-300">live here.</em>
          </h2>
          <p className="text-cream-100/70 mb-7 text-lg">
            Reserve your spot and we'll send you an invite the moment we open the doors.
          </p>
          <a
            href="#signup"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-forest-900 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40 hover:-translate-y-0.5"
          >
            Reserve my spot <ArrowRight size={16} />
          </a>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cream-100/10 px-4 sm:px-6 lg:px-8 py-7">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-100/50">
          <p>© {new Date().getFullYear()} CB 5 Connect. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/preview" className="hover:text-gold-300 transition-colors">
              Preview the app →
            </Link>
            <span>Brooklyn Community Board 5 · Launching soon.</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 22s ease infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient { animation: none; }
        }
      `}</style>
    </div>
  )
}

export default LandingPage
