import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext'; // Import context

function Navbar() {
  const navigate = useNavigate();
  // Pull our global state and functions
  const { user, login, logout, loading } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      return alert("Login blocked by browser. Please check console.");
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await res.json();

      if (res.ok && data.status === 'Success') {
        // Save user globally
        login(data.user); 
        
        // Redirect based on role
        if (data.user.role === 'Manager') {
          navigate('/admin');
        } else {
          navigate('/profile'); 
        }
      } else {
        alert(data.message || 'Login failed on the server.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          
          {/* CONDITIONAL RENDERING BASED ON AUTH STATE */}
          {!loading && (
            <>
              {user ? (
                // IF LOGGED IN
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
                  
                  {/* Show Admin Dashboard Link if Manager */}
                  {user.role === 'Manager' ? (
                    <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""} style={{ color: '#00ffcc', fontWeight: 'bold' }}>
                      Admin Hub
                    </NavLink>
                  ) : (
                    <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                      Profile
                    </NavLink>
                  )}
                  
                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout} 
                    style={{
                      background: 'rgba(255, 50, 50, 0.2)',
                      border: '1px solid rgba(255, 50, 50, 0.5)',
                      color: 'white',
                      padding: '0.4rem 1rem',
                      borderRadius: '50px',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // IF LOGGED OUT
                <div style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => alert('Google Login window failed to open or was closed.')}
                    shape="pill"            
                    theme="filled_black"    
                    text="signin_with"      
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;