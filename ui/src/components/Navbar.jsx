import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Building2, Calendar, MessageSquare, ClipboardList,
  Image, Shield, Newspaper, Menu, X, LogOut, LogIn, ChevronDown,
} from 'lucide-react'
import { adminAPI } from '../services/api'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hasLogo, setHasLogo] = useState(false)
  const dropdownRef = useRef(null)

  const isAdmin = adminAPI.isLoggedIn()

  useEffect(() => {
    fetch('/logo.png', { method: 'HEAD' })
      .then((r) => setHasLogo(r.ok))
      .catch(() => setHasLogo(false))
  }, [])

  const handleLogout = () => {
    adminAPI.logout()
    setMobileOpen(false)
    navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setDropdownOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  const primaryNav = [
    { path: '/preview', label: 'Home', icon: Home },
    { path: '/businesses', label: 'Businesses', icon: Building2 },
    { path: '/events', label: 'Events', icon: Calendar },
  ]

  const communityNav = [
    { path: '/daily-report', label: 'Daily Report', icon: Newspaper },
    { path: '/complaints', label: 'Complaints', icon: MessageSquare },
    { path: '/committee-updates', label: 'Committee Updates', icon: ClipboardList },
    { path: '/gallery', label: 'Gallery', icon: Image },
  ]

  const isActive = (path) => location.pathname === path
  const isCommunityActive = communityNav.some((item) => isActive(item.path))

  const linkClass = (active) =>
    `relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all duration-250 ease-brand ${
      active
        ? 'text-gold-700 bg-gold-50'
        : 'text-forest-800 hover:text-gold-700 hover:bg-cream-100'
    }`

  return (
    <nav className="bg-cream-50/95 backdrop-blur-md border-b border-forest-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/preview" className="flex items-center gap-2 shrink-0 group">
            {hasLogo ? (
              <img
                src="/logo.png"
                alt="CB 5"
                className="w-10 h-10 object-contain transition-transform duration-250 ease-brand group-hover:scale-105"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-forest-700 to-gold-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-cream-50 font-bold text-[11px] tracking-tight">CB5</span>
              </div>
            )}
            <span className="font-display text-2xl tracking-tight leading-none">
              <em className="not-italic text-gold-600">Connect</em>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {primaryNav.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.path} to={item.path} className={linkClass(isActive(item.path))}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Community dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all duration-250 ease-brand ${
                  isCommunityActive
                    ? 'text-gold-700 bg-gold-50'
                    : 'text-forest-800 hover:text-gold-700 hover:bg-cream-100'
                }`}
              >
                <MessageSquare size={16} />
                <span>Community</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-250 ease-brand ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-cream-50 rounded-xl shadow-xl shadow-forest-900/10 border border-forest-100 py-1.5 z-50 overflow-hidden">
                  {communityNav.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150 ${
                          isActive(item.path)
                            ? 'text-gold-700 bg-gold-50 font-medium'
                            : 'text-forest-800 hover:bg-cream-100 hover:text-gold-700'
                        }`}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Admin link */}
            {isAdmin && (
              <Link to="/admin/submissions" className={linkClass(isActive('/admin/submissions'))}>
                <Shield size={16} />
                <span>Admin</span>
              </Link>
            )}

            {/* Divider + auth */}
            <div className="w-px h-6 bg-forest-100 mx-2" />
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors duration-250 ease-brand"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            ) : (
              <Link to="/admin/login" className={linkClass(isActive('/admin/login'))}>
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-forest-800 hover:text-gold-700 p-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-forest-100 bg-cream-50">
          <div className="px-4 py-3 space-y-1">
            <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-forest-400 uppercase tracking-[0.18em]">
              Navigate
            </p>
            {primaryNav.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-gold-700 bg-gold-50'
                      : 'text-forest-800 hover:text-gold-700 hover:bg-cream-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <p className="px-3 pt-4 pb-2 text-[10px] font-semibold text-forest-400 uppercase tracking-[0.18em]">
              Community
            </p>
            {communityNav.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-gold-700 bg-gold-50'
                      : 'text-forest-800 hover:text-gold-700 hover:bg-cream-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <div className="border-t border-forest-100 mt-2 pt-2">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/submissions"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/submissions')
                        ? 'text-gold-700 bg-gold-50'
                        : 'text-forest-800 hover:text-gold-700 hover:bg-cream-100'
                    }`}
                  >
                    <Shield size={18} />
                    <span>Admin Panel</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors w-full"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/login')
                      ? 'text-gold-700 bg-gold-50'
                      : 'text-forest-800 hover:text-gold-700 hover:bg-cream-100'
                  }`}
                >
                  <LogIn size={18} />
                  <span>Admin Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
