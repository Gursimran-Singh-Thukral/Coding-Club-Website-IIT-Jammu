import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <nav className="navbar glass-nav">
      <div className="container nav-content">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          IITJ <span className="text-gradient">&lt;Code/&gt;</span>
        </Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          
          {/* Conditional Events Link */}
          <NavLink 
            to={user?.isAdmin ? "/admin/events" : "/events"} 
            onClick={() => setMenuOpen(false)} 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Events
          </NavLink>
          
          <NavLink to="/team" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Our Team</NavLink>
          
          {/* Profile / Sign In Link */}
          {!user ? (
            <NavLink 
              to="/login" 
              onClick={() => setMenuOpen(false)} 
              className={({ isActive }) => isActive ? "btn-primary active" : "btn-primary"} 
              style={{ color: 'white', padding: '0.5rem 1.2rem' }}
            >
              Sign In / Login
            </NavLink>
          ) : (
            <NavLink 
              to={user?.isAdmin ? "/admin" : "/profile"} 
              onClick={() => setMenuOpen(false)} 
              className={({ isActive }) => isActive ? "btn-primary active" : "btn-primary"} 
              style={{ color: 'white', padding: '0.5rem 1.2rem' }}
            >
              Profile
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
