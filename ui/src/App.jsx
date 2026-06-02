import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
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

// Routes that render their own full-bleed chrome (no global Navbar/Footer)
const BARE_ROUTES = new Set(['/', '/coming-soon'])

function Shell() {
  const { pathname } = useLocation()
  const bare = BARE_ROUTES.has(pathname)

  return (
    <div className="min-h-screen flex flex-col">
      {!bare && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/coming-soon" element={<LandingPage />} />
          <Route path="/preview" element={<HomePage />} />
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
      {!bare && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </Router>
  )
}

export default App
