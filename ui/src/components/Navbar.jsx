import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Building2, Calendar, MessageSquare, ClipboardList, Image, Shield, Newspaper, Menu, X } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = !!localStorage.getItem('adminToken')

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/daily-report', label: 'Daily Report', icon: Newspaper },
    { path: '/businesses', label: 'Businesses', icon: Building2 },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/complaints', label: 'Complaints', icon: MessageSquare },
    { path: '/committee-updates', label: 'Committee Updates', icon: ClipboardList },
    { path: '/gallery', label: 'Gallery', icon: Image },
    ...(isAdmin ? [{ path: '/admin/submissions', label: 'Admin', icon: Shield }] : []),
  ]

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">The Competent Community</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-600 hover:text-primary-600 focus:outline-none p-2 rounded-md"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
