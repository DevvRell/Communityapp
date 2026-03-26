import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { adminAPI } from '../services/api'

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading') // loading | valid | invalid

  useEffect(() => {
    if (!adminAPI.isLoggedIn()) {
      setStatus('invalid')
      return
    }

    adminAPI.validate().then((ok) => {
      if (ok) {
        setStatus('valid')
      } else {
        adminAPI.logout()
        setStatus('invalid')
      }
    })
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (status === 'invalid') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute
