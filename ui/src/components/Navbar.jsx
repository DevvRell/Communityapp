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
  const dropdownRef = useRef(null)

  const isAdmin = adminAPI.isLoggedIn()

  const handleLogout = () => {
    adminAPI.logout()
    setMobileOpen(false)
    navigate('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  // Top-level nav items
  const primaryNav = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/businesses', label: 'Businesses', icon: Building2 },
    { path: '/events', label: 'Events', icon: Calendar },
  ]

  // Grouped under "Community" dropdown
  const communityNav = [
    { path: '/daily-report', label: 'Daily Report', icon: Newspaper },
    { path: '/complaints', label: 'Complaints', icon: MessageSquare },
    { path: '/committee-updates', label: 'Committee Updates', icon: ClipboardList },
    { path: '/gallery', label: 'Gallery', icon: Image },
  ]

  const isActive = (path) => location.pathname === path
  const isCommunityActive = communityNav.some((item) => isActive(item.path))

  const linkClass = (active) =>
    `flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      active
        ? 'text-primary-600 bg-primary-50'
        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
    }`

  // All items flat for mobile
  const allNavItems = [
    ...primaryNav,
    ...communityNav,
    ...(isAdmin ? [{ path: '/admin/submissions', label: 'Admin Panel', icon: Shield }] : []),
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">
              The Competent Community
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Primary links */}
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
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isCommunityActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare size={16} />
                <span>Community</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {communityNav.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150 ${
                          isActive(item.path)
                            ? 'text-primary-600 bg-primary-50 font-medium'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
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
            <div className="w-px h-6 bg-gray-200 mx-1.5" />
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
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
            className="lg:hidden text-gray-600 hover:text-primary-600 p-2 rounded-md"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {/* Main section */}
            <p className="px-3 pt-1 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigate
            </p>
            {primaryNav.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Community section */}
            <p className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Community
            </p>
            {communityNav.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Auth section */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/submissions"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/submissions')
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Shield size={18} />
                    <span>Admin Panel</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/login')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
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
