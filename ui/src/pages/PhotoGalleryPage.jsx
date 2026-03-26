import { useState, useEffect } from 'react'
import { Image as ImageIcon, Upload, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '../components/Toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const PhotoGalleryPage = () => {
  const toast = useToast()
  const [file, setFile] = useState(null)
  const [submitterName, setSubmitterName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState([])
  const [photosLoading, setPhotosLoading] = useState(true)

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/photos`)
      if (res.ok) {
        const data = await res.json()
        setPhotos(data)
      }
    } catch {
      // silently fail — gallery just shows empty
    } finally {
      setPhotosLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, GIF, or WebP.')
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error('File too large. Max 10 MB.')
      return
    }
    setFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a photo.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const headers = {
        'X-User-Id': submitterName.trim() || 'Anonymous',
      }

      const res = await fetch(`${API_BASE}/api/photos/upload`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (res.ok) {
        toast.success('Photo submitted for review! It will appear in the gallery once approved.')
        setFile(null)
        setSubmitterName('')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Upload failed. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ImageIcon className="text-primary-600" size={32} />
            Photo Gallery
          </h1>
          <p className="mt-2 text-gray-600">Submit a photo for review or browse approved community photos.</p>
        </div>

        {/* Upload section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload size={20} />
            Submit a photo
          </h2>
          <p className="text-sm text-gray-600 mb-4">Photos are reviewed by an admin before appearing in the gallery. Max 10 MB; JPEG, PNG, GIF, WebP.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="submitter-name" className="block text-sm font-medium text-gray-700 mb-1">
                Your name (optional)
              </label>
              <input
                id="submitter-name"
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                className="input-field w-full max-w-sm"
                placeholder="Enter your name"
              />
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const f = e.dataTransfer.files?.[0]
                if (f) handleFileChange({ target: { files: [f] } })
              }}
              onClick={() => document.getElementById('photo-upload').click()}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-primary-600 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <ImageIcon size={40} className="text-gray-300" />
                  <p>Drop a photo here or click to browse</p>
                  <p className="text-sm">JPEG, PNG, GIF, WebP — max 10 MB</p>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary mt-4 flex items-center space-x-2" disabled={!file || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Submit for review</span>
              )}
            </button>
          </form>
        </div>

        {/* Approved gallery */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle size={22} className="text-green-600" />
            Approved Photos
            <span className="text-sm font-normal text-gray-400 ml-1">({photos.length})</span>
          </h2>
          {photosLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          ) : photos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No approved photos yet. Be the first to submit one!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.originalName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{photo.originalName}</p>
                    {photo.submittedBy && photo.submittedBy !== 'Admin' && (
                      <p className="text-xs text-gray-500">by {photo.submittedBy}</p>
                    )}
                    <p className="text-xs text-gray-400">{new Date(photo.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotoGalleryPage
