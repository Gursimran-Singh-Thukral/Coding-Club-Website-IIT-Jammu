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

// These routes are standalone full-screen pages (no navbar/bg canvas)
const STANDALONE_ROUTES = ['/admin/attendance', '/admin/attendance-list', '/attend']

function App() {
  const location = useLocation()
  const isStandalone = STANDALONE_ROUTES.some(r => location.pathname.startsWith(r))

  return (
    <>
      {/* Dynamic Particle Canvas Background — hidden on standalone pages */}
      {!isStandalone && <CinematicBg />}

      {/* Global Navigation Bar — hidden on standalone pages */}
      {!isStandalone && <Navbar />}

      {/* Route Switcher */}
      <Routes>
        <Route path="/"                         element={<Home />} />
        <Route path="/events"                   element={<Events />} />
        <Route path="/team"                     element={<Team />} />
        <Route path="/profile"                  element={<Profile />} />
        <Route path="/admin"                    element={<AdminProfile />} />
        <Route path="/admin/events"             element={<AdminEvents />} />
        <Route path="/admin/attendance/:eventId" element={<AttendanceHost />} />
        <Route path="/admin/attendance-list/:eventId" element={<AttendanceList />} />
        <Route path="/attend/:token"            element={<AttendanceConfirm />} />
        <Route path="/login"                    element={<Auth />} />
     </Routes>

        {/* Footer - hidden on standalone pages */}
        {!isStandalone && (
          <footer style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            fontSize: '0.9rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <p style={{ margin: 0 }}>
              2026 © <strong style={{ color: '#fff' }}>IITJ Coding Club</strong> | Developed &amp; Maintained by <strong style={{ color: '#fff' }}>IITJ Coding Club</strong>.
            </p>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
             <a href="https://www.instagram.com/codeclub.iitjmu/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', display: 'flex' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  </a>
            </div>
          </footer>
        )}
      </>
  )
}

export default App
