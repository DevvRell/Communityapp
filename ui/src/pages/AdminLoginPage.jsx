import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Loader2 } from 'lucide-react'
import { adminAPI } from '../services/api'
import { useToast } from '../components/Toast'

const AdminLoginPage = () => {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (adminAPI.isLoggedIn()) {
      navigate('/admin/submissions', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { token } = await adminAPI.login(password)
      localStorage.setItem('adminToken', token)
      toast.success('Logged in successfully!')
      navigate('/admin/submissions')
    } catch (err) {
      toast.error(err.message || 'Invalid password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg shadow-forest-900/5 border border-forest-100 p-8">
          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-forest-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-forest-900/20">
              <Shield className="text-gold-300" size={28} />
            </div>
            <h1 className="font-display text-3xl text-forest-900 tracking-tight">Admin Login</h1>
            <p className="text-forest-600 mt-2">Enter the admin password to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full"
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
