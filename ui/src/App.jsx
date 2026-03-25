import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TestHomePage from './pages/TestHomePage'
import BusinessDirectory from './pages/BusinessDirectory'
import EventsPage from './pages/EventsPage'
import ComplaintsPage from './pages/ComplaintsPage'
import CommitteeUpdatesPage from './pages/CommitteeUpdatesPage'
import PhotoGalleryPage from './pages/PhotoGalleryPage'
import AdminSubmissionsPage from './pages/AdminSubmissionsPage'

function App() {
  return (
    <Router>
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
            <Route path="/gallery" element={<PhotoGalleryPage />} />
            <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App 