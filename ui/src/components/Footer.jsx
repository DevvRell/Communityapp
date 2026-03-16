import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold">The Competent Community</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting our community through local businesses, events, and open communication. 
              Together we build a stronger, more united neighborhood.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:contact@unitethehood.com" className="text-gray-300 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
              <a href="tel:+1234567890" className="text-gray-300 hover:text-white transition-colors">
                <Phone size={20} />
              </a>
              <span className="text-gray-300">
                <MapPin size={20} />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/businesses" className="text-gray-300 hover:text-white transition-colors">
                  Business Directory
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="text-gray-300 hover:text-white transition-colors">
                  Complaints
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-300">
              <p>contact@unitethehood.com</p>
              <p>+1 (234) 567-8900</p>
              <p>123 Community St<br />Neighborhood, NY 10001</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 The Competent Community. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 