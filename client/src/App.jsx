import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import CinematicBg from './components/CinematicBg'
import Home from './pages/Home'
import Events from './pages/Events'
import Team from './pages/Team'
import Profile from './pages/Profile'
import AdminProfile from './pages/AdminProfile'
import AdminEvents from './pages/AdminEvents'
import AttendanceHost from './pages/AttendanceHost'
import AttendanceConfirm from './pages/AttendanceConfirm'
import AttendanceList from './pages/AttendanceList'
import Auth from './pages/Auth'

// NEW: Import the AuthProvider
import { AuthProvider } from './context/AuthContext'

const STANDALONE_ROUTES = ['/admin/attendance', '/admin/attendance-list', '/attend']

function App() {
  const location = useLocation()
  const isStandalone = STANDALONE_ROUTES.some(r => location.pathname.startsWith(r))

  return (
    // Wrap everything in AuthProvider
    <AuthProvider>
      {!isStandalone && <CinematicBg />}
      {!isStandalone && <Navbar />}

      <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/events"           element={<Events />} />
        <Route path="/team"             element={<Team />} />
        <Route path="/profile"          element={<Profile />} />
        <Route path="/admin"            element={<AdminProfile />} />
        <Route path="/admin/events"     element={<AdminEvents />} />
        <Route path="/admin/attendance/:eventId" element={<AttendanceHost />} />
        <Route path="/admin/attendance-list/:eventId" element={<AttendanceList />} />
        <Route path="/attend/:token"    element={<AttendanceConfirm />} />
        <Route path="/login"            element={<Auth />} />
      </Routes>
    </AuthProvider>
  )
}

export default App