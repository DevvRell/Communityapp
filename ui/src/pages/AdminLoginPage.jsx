import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Loader2 } from 'lucide-react'
import { adminAPI } from '../services/api'

const AdminLoginPage = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (adminAPI.isLoggedIn()) {
      navigate('/admin/submissions', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { token } = await adminAPI.login(password)
      localStorage.setItem('adminToken', token)
      navigate('/admin/submissions')
    } catch (err) {
      setError(err.message || 'Invalid password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-primary-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-1">Enter the admin password to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field w-full"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
