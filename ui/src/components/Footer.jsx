import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const [hasLogo, setHasLogo] = useState(false)

  useEffect(() => {
    fetch('/logo.png', { method: 'HEAD' })
      .then((r) => setHasLogo(r.ok))
      .catch(() => setHasLogo(false))
  }, [])

  return (
    <footer className="relative bg-forest-900 text-cream-50 overflow-hidden">
      {/* Brand accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-forest-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              {hasLogo ? (
                <img src="/logo.png" alt="CB 5" className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-gold-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-cream-50 font-bold text-[11px] tracking-tight">CB5</span>
                </div>
              )}
              <span className="font-display text-3xl tracking-tight leading-none">
                <em className="not-italic text-gold-300">Connect</em>
              </span>
            </div>
            <p className="text-cream-100/70 mb-6 max-w-md leading-relaxed">
              The digital home of Brooklyn Community Board 5 — connecting local
              businesses, events, and neighbors through open communication.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:info@brooklyncb5.org"
                className="w-9 h-9 rounded-lg bg-forest-800/60 border border-cream-100/10 flex items-center justify-center text-cream-100/80 hover:text-gold-300 hover:border-gold-400/40 transition-all"
              >
                <Mail size={16} />
              </a>
              <a
                href="tel:+17186294744"
                className="w-9 h-9 rounded-lg bg-forest-800/60 border border-cream-100/10 flex items-center justify-center text-cream-100/80 hover:text-gold-300 hover:border-gold-400/40 transition-all"
              >
                <Phone size={16} />
              </a>
              <span className="w-9 h-9 rounded-lg bg-forest-800/60 border border-cream-100/10 flex items-center justify-center text-cream-100/80">
                <MapPin size={16} />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-[11px] font-semibold text-gold-300 uppercase tracking-[0.18em] mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: '/preview', label: 'Home' },
                { to: '/businesses', label: 'Business Directory' },
                { to: '/events', label: 'Events' },
                { to: '/gallery', label: 'Photo Gallery' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-cream-100/75 hover:text-gold-300 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community / Contact */}
          <div className="md:col-span-4">
            <h3 className="text-[11px] font-semibold text-gold-300 uppercase tracking-[0.18em] mb-4">
              Reach Us
            </h3>
            <div className="space-y-2 text-cream-100/75">
              <p>info@brooklyncb5.org</p>
              <p>(718) 629-4744</p>
              <p>1285 Decatur St<br />Brooklyn, NY 11207</p>
            </div>
          </div>
        </div>

        <div className="border-t border-cream-100/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-100/50">
          <p>© {new Date().getFullYear()} CB 5 Connect. All rights reserved.</p>
          <p>Brooklyn Community Board 5</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
