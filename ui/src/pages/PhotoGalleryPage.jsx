import { useState } from 'react'
import { Image as ImageIcon, Upload, CheckCircle } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Mock approved photos until API is ready
const MOCK_APPROVED_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', originalName: 'park_trail.jpg', createdAt: '2024-02-10T12:00:00Z' },
  { id: 2, url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop', originalName: 'community_garden.jpg', createdAt: '2024-02-09T09:00:00Z' },
  { id: 3, url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop', originalName: 'downtown.jpg', createdAt: '2024-02-08T14:00:00Z' },
  { id: 4, url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop', originalName: 'city_view.jpg', createdAt: '2024-02-07T11:00:00Z' },
]

const PhotoGalleryPage = () => {
  const [file, setFile] = useState(null)
  const [submitMessage, setSubmitMessage] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type)) {
      setSubmitMessage({ type: 'error', text: 'Invalid file type. Use JPEG, PNG, GIF, or WebP.' })
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      setSubmitMessage({ type: 'error', text: 'File too large. Max 10 MB.' })
      return
    }
    setFile(f)
    setSubmitMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setSubmitMessage({ type: 'error', text: 'Please select a photo.' })
      return
    }
    setSubmitMessage({ type: 'info', text: 'Upload is mocked. When API is connected, the photo will be sent for review.' })
    setFile(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const f = e.dataTransfer.files?.[0]
                if (f) handleFileChange({ target: { files: [f] } })
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                {file ? (
                  <p className="text-primary-600 font-medium">{file.name}</p>
                ) : (
                  <p className="text-gray-600">Drop a photo here or click to browse</p>
                )}
              </label>
            </div>
            {submitMessage && (
              <p className={`mt-2 text-sm ${submitMessage.type === 'error' ? 'text-red-600' : 'text-primary-600'}`}>
                {submitMessage.text}
              </p>
            )}
            <button type="submit" className="btn-primary mt-4" disabled={!file}>
              Submit for review
            </button>
          </form>
        </div>

        {/* Approved gallery */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={22} className="text-green-600" />
            Approved photos
          </h2>
          <p className="text-sm text-gray-500 mb-6">Mock data below. When API is connected, approved photos will load from the server.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_APPROVED_PHOTOS.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.originalName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{photo.originalName}</p>
                  <p className="text-xs text-gray-500">{new Date(photo.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoGalleryPage
