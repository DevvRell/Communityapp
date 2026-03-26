import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import TestHomePage from './pages/TestHomePage'
import BusinessDirectory from './pages/BusinessDirectory'
import EventsPage from './pages/EventsPage'
import ComplaintsPage from './pages/ComplaintsPage'
import CommitteeUpdatesPage from './pages/CommitteeUpdatesPage'
import PhotoGalleryPage from './pages/PhotoGalleryPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminSubmissionsPage from './pages/AdminSubmissionsPage'
import CommitteeNotesSubmitPage from './pages/CommitteeNotesSubmitPage'

function App() {
  return (
    <Router>
      <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/daily-report" element={<TestHomePage />} />
            <Route path="/businesses" element={<BusinessDirectory />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/committee-updates" element={<CommitteeUpdatesPage />} />
            <Route path="/committee-updates/submit" element={<CommitteeNotesSubmitPage />} />
            <Route path="/gallery" element={<PhotoGalleryPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/submissions" element={
              <ProtectedRoute>
                <AdminSubmissionsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
      </ToastProvider>
    </Router>
  )
}

export default App
