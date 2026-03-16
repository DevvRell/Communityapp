import { useState } from 'react'
import { Image as ImageIcon, Upload, CheckCircle, Clock } from 'lucide-react'
import { getPhotos, addPhoto, init } from '../services/mockStore'

init()

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const PhotoGalleryPage = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submittedBy, setSubmittedBy] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [, forceRender] = useState(0)
  const refresh = () => forceRender(n => n + 1)

  const approvedPhotos = getPhotos('APPROVED')

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Use JPEG, PNG, GIF, or WebP.' })
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: 'File too large. Max 10 MB.' })
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a photo.' })
      return
    }
    setSubmitting(true)

    // Read as data URL so it persists in localStorage
    const reader = new FileReader()
    reader.onload = () => {
      try {
        addPhoto({
          url: reader.result,
          originalName: file.name,
          submittedBy: submittedBy || 'Anonymous',
        })
        setMessage({
          type: 'success',
          text: 'Photo submitted for review. It will appear in the gallery once approved by an admin.',
        })
        setFile(null)
        setPreview(null)
        setSubmittedBy('')
        refresh()
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to save photo. Try a smaller file.' })
      } finally {
        setSubmitting(false)
      }
    }
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read file.' })
      setSubmitting(false)
    }
    reader.readAsDataURL(file)
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
          <p className="text-sm text-gray-600 mb-4">
            Photos are reviewed by an admin before appearing in the gallery. Max 10 MB; JPEG, PNG, GIF, WebP.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drop zone */}
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
              {preview ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
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

            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-gray-400">(optional)</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="How should we credit you?"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`flex items-start gap-2 p-3 rounded-lg ${
                message.type === 'error' ? 'bg-red-50 text-red-700' :
                message.type === 'success' ? 'bg-green-50 text-green-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {message.type === 'success'
                  ? <CheckCircle size={18} className="shrink-0 mt-0.5" />
                  : <Clock size={18} className="shrink-0 mt-0.5" />
                }
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={!file || submitting}>
              {submitting ? 'Uploading…' : 'Submit for Review'}
            </button>
          </form>
        </div>

        {/* Approved gallery */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle size={22} className="text-green-600" />
            Approved Photos
            <span className="text-sm font-normal text-gray-400 ml-1">({approvedPhotos.length})</span>
          </h2>

          {approvedPhotos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <ImageIcon className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No approved photos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {approvedPhotos.map((photo) => (
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
