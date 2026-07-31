import React from 'react'
import { NavLink, Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar glass-nav">
      <div className="container nav-content">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          IITJ <span className="text-gradient">&lt;Code/&gt;</span>
        </Link>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>Events</NavLink>
          <NavLink to="/team" className={({ isActive }) => isActive ? "active" : ""}>Our Team</NavLink>
          <NavLink to="/login" className={({ isActive }) => isActive ? "btn-primary active" : "btn-primary"} style={{ color: 'white', padding: '0.5rem 1.2rem' }}>Sign In / Login</NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
