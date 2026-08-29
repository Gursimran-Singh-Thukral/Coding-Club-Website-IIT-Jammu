import React, { useState, useEffect, useRef } from 'react'

// ── Interactive Mesh Grid Background Component ──────────────────────────────
// Renders a professional, subtle 3D perspective grid canvas.
// When the cursor moves, the mesh lines bend downwards (away/sunken) at that spot.
// ────────────────────────────────────────────────────────────────────────────
function InteractiveGridMesh() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: null, y: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    const handleMouseLeave = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Grid configuration
    const gridSpacing = 45
    const influenceRadius = 160
    const bendStrength = -30 

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
      bgGrad.addColorStop(0, '#030308')
      bgGrad.addColorStop(1, '#070712')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      const mouse = mouseRef.current
      const cols = Math.ceil(width / gridSpacing) + 2
      const rows = Math.ceil(height / gridSpacing) + 2

      // Create a 2D mesh of points
      const points = []
      for (let r = 0; r < rows; r++) {
        points[r] = []
        for (let c = 0; c < cols; c++) {
          const origX = (c - 1) * gridSpacing
          const origY = (r - 1) * gridSpacing

          let currentX = origX
          let currentY = origY

          // Apply interactive bending/depression if mouse is inside canvas
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - origX
            const dy = mouse.y - origY
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < influenceRadius) {
              const factor = (1 + Math.cos((dist / influenceRadius) * Math.PI)) / 2
              const offset = factor * bendStrength
              const angle = Math.atan2(dy, dx)

              currentX += Math.cos(angle) * offset
              currentY += Math.sin(angle) * offset
            }
          }

          points[r][c] = { x: currentX, y: currentY }
        }
      }

      // Draw grid line segments with professional low opacity
      ctx.lineWidth = 0.8
      
      // Horizontal Lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath()
        for (let c = 0; c < cols; c++) {
          if (c === 0) ctx.moveTo(points[r][c].x, points[r][c].y)
          else ctx.lineTo(points[r][c].x, points[r][c].y)
        }
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)'
        ctx.stroke()
      }

      // Vertical Lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath()
        for (let r = 0; r < rows; r++) {
          if (r === 0) ctx.moveTo(points[r][c].x, points[r][c].y)
          else ctx.lineTo(points[r][c].x, points[r][c].y)
        }
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)'
        ctx.stroke()
      }

      // Draw subtle nodes at grid intersections near cursor
      if (mouse.x !== null && mouse.y !== null) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const pt = points[r][c]
            const dx = mouse.x - pt.x
            const dy = mouse.y - pt.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < influenceRadius) {
              const alpha = (1 - dist / influenceRadius) * 0.28
              ctx.beginPath()
              ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`
              ctx.fill()
            }
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}

// ── Auth Page Component ──────────────────────────────────────────────────────
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true) // Switch between Sign In & Sign Up
  const [form, setForm] = useState({ username: '', password: '', email: '' })
  const [toast, setToast] = useState(null)

  const showToast = (text, success = true) => {
    setToast({ text, success })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.username || !form.password || (!isLogin && !form.email)) {
      showToast('Please fill in all required fields.', false)
      return
    }
    
    showToast(`${isLogin ? 'Sign In' : 'Sign Up'} successful! Welcome back, ${form.username}.`, true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '8rem 1.5rem 4rem',
      boxSizing: 'border-box'
    }}>
      {/* Mesh grid canvas background */}
      <InteractiveGridMesh />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .auth-container {
          font-family: 'Inter', sans-serif;
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
        }

        .auth-glass-card {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: none;
          backdrop-filter: none;
          border-radius: 16px;
          padding: 3rem 2.2rem;
          box-sizing: border-box;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .auth-glass-card:hover {
          border-color: rgba(0, 229, 255, 0.15);
          box-shadow: 0 0 40px rgba(0, 229, 255, 0.03);
        }

        .auth-input-group {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .auth-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.8rem 1rem;
          box-sizing: border-box;
          color: #fff;
          font-size: 0.92rem;
          outline: none;
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .auth-input:focus {
          border-color: #00e5ff;
          background: rgba(0, 229, 255, 0.04);
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.18);
        }

        .auth-label {
          font-size: 0.75rem;
          color: #a0a0a0;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          margin-bottom: 0.4rem;
          display: block;
          font-weight: 600;
        }

        .auth-submit-btn {
          width: 100%;
          padding: 0.85rem;
          background: transparent;
          border: 1px solid rgba(0, 229, 255, 0.4);
          border-radius: 8px;
          color: #00e5ff;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: inherit;
          margin-top: 0.75rem;
        }

        .auth-submit-btn:hover {
          transform: translateY(-1px);
          background: rgba(0, 229, 255, 0.05);
          border-color: #00e5ff;
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.25);
        }

        .auth-toggle-link {
          color: #00e5ff;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }

        .auth-toggle-link:hover {
          color: #80f2ff;
        }

        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-glass-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {/* IITJ Logo Outline */}
            <div style={{
              width: 52, height: 52, borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              alignItems: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.25rem', color: '#00e5ff',
              fontFamily: 'monospace', fontWeight: 800,
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.1)'
            }}>
              &lt;/&gt;
            </div>
            <h2 style={{ color: '#fff', margin: '0 0 0.4rem 0', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p style={{ color: '#666', margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }}>
              Enter your credentials to access the Coding Club portal.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="auth-input-group">
              <label className="auth-label">Username</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. rohit_dev"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </div>

            {/* Email (Registration only) */}
            {!isLogin && (
              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="e.g. name@iitjammu.ac.in"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            )}

            {/* Password */}
            <div className="auth-input-group" style={{ marginBottom: '1.75rem' }}>
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Submit */}
            <button type="submit" className="auth-submit-btn">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* Toggle link */}
          <p style={{ color: '#555', fontSize: '0.82rem', textAlign: 'center', marginTop: '1.75rem', marginBottom: 0 }}>
            {isLogin ? "New member? " : "Already have an account? "}
            <span className="auth-toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Create one now' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem',
          background: toast.success ? 'rgba(0, 255, 127, 0.08)' : 'rgba(255, 68, 68, 0.08)',
          border: `1px solid ${toast.success ? '#00ff7f' : '#ff4444'}40`,
          color: toast.success ? '#00ff7f' : '#ff6b6b',
          padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem',
          animation: 'toast-in 0.25s ease both', zIndex: 10000,
          boxShadow: `0 8px 30px rgba(0, 0, 0, 0.3)`,
        }}>
          {toast.success ? '✓ ' : '⚠️ '}{toast.text}
        </div>
      )}
    </div>
  )
}

