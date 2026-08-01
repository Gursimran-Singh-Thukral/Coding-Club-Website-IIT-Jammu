import React, { useState, useEffect } from 'react'

// ── AttendanceConfirm ───────────────────────────────────────────────────────
// Opened when a student scans the attendance QR code.
// URL format: /attend/:token?eid=<eventId>
//
// On mount → POST /api/attendance/scan → show success or error screen.
// ───────────────────────────────────────────────────────────────────────────

function getUrlParams() {
  const match = window.location.pathname.match(/\/attend\/([^?/]+)/)
  const token = match ? match[1] : null
  const params = new URLSearchParams(window.location.search)
  const eid = params.get('eid')
  return { token, eventId: eid ? parseInt(eid) : null }
}

// Animated checkmark SVG
function CheckMark() {
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={45} fill="none" stroke="rgba(0,255,127,.3)" strokeWidth={3} />
      <circle cx={50} cy={50} r={45} fill="none" stroke="#00ff7f" strokeWidth={3}
        strokeDasharray="283" strokeDashoffset="0"
        style={{ animation: 'ring-draw 1s ease forwards', strokeLinecap: 'round' }} />
      <polyline points="28,50 44,66 72,34" fill="none" stroke="#00ff7f" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 60, strokeDashoffset: 60, animation: 'check-draw .6s .6s ease forwards' }} />
    </svg>
  )
}

function CrossMark() {
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={45} fill="none" stroke="rgba(255,68,68,.3)" strokeWidth={3} />
      <circle cx={50} cy={50} r={45} fill="none" stroke="#ff4444" strokeWidth={3}
        strokeDasharray="283" strokeDashoffset="0"
        style={{ animation: 'ring-draw 1s ease forwards' }} />
      <line x1="33" y1="33" x2="67" y2="67" stroke="#ff4444" strokeWidth={5} strokeLinecap="round"
        style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: 'check-draw .5s .5s ease forwards' }} />
      <line x1="67" y1="33" x2="33" y2="67" stroke="#ff4444" strokeWidth={5} strokeLinecap="round"
        style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: 'check-draw .5s .7s ease forwards' }} />
    </svg>
  )
}

// Floating particle
function Particle({ x, y, color, delay }) {
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      width: 4, height: 4, borderRadius: '50%', background: color,
      boxShadow: `0 0 6px ${color}`,
      animation: `float-particle 4s ${delay}s ease-in-out infinite`,
      pointerEvents: 'none',
    }} />
  )
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  color: ['#00ff7f', '#00e5ff', '#a855f7'][i % 3],
  delay: Math.random() * 4,
}))

export default function AttendanceConfirm() {
  const [status, setStatus]         = useState('verifying') // 'verifying' | 'success' | 'error' | 'already'
  const [message, setMessage]       = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [jmxEarned, setJmxEarned]   = useState(0)
  const [showJmx, setShowJmx]       = useState(false)

  useEffect(() => {
    const { token, eventId } = getUrlParams()

    if (!token || !eventId) {
      setStatus('error')
      setMessage('Invalid attendance link. Please scan the QR code again.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/attendance/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, eventId }),
        })
        const data = await res.json()

        if (res.ok && data.success) {
          setStatus('success')
          setEventTitle(data.eventTitle || 'this event')
          setJmxEarned(data.jmxEarned || 50)
          // Trigger JmX badge reveal after icon animation
          setTimeout(() => setShowJmx(true), 1200)
        } else {
          if (data.message && data.message.toLowerCase().includes('already')) {
            setStatus('already')
          } else {
            setStatus('error')
          }
          setMessage(data.message || 'Verification failed.')
        }
      } catch {
        setStatus('error')
        setMessage('Network error — check your connection and try again.')
      }
    }

    // Short delay so user sees the "verifying" screen
    const t = setTimeout(verify, 600)
    return () => clearTimeout(t)
  }, [])

  const isSuccess = status === 'success'
  const isAlready = status === 'already'

  const screenConfig = {
    success: {
      title: 'Attendance Confirmed!',
      sub:   `You're in for ${eventTitle}`,
      color: '#00ff7f',
      glow:  'rgba(0,255,127,.15)',
      icon:  <CheckMark />,
    },
    already: {
      title: 'Already Checked In',
      sub:   'Your attendance was previously recorded.',
      color: '#00e5ff',
      glow:  'rgba(0,229,255,.12)',
      icon:  <CheckMark />,
    },
    error: {
      title: 'Check-in Failed',
      sub:   message || 'Something went wrong.',
      color: '#ff4444',
      glow:  'rgba(255,68,68,.12)',
      icon:  <CrossMark />,
    },
    verifying: {
      title: 'Verifying…',
      sub:   'Checking your QR token',
      color: '#00e5ff',
      glow:  'rgba(0,229,255,.08)',
      icon:  null,
    },
  }

  const cfg = screenConfig[status]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 40%, rgba(0,255,127,.05) 0%, #060610 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes ring-draw    { from { stroke-dashoffset: 283 } to { stroke-dashoffset: 0 } }
        @keyframes check-draw   { to   { stroke-dashoffset: 0 } }
        @keyframes pop-in       { 0%{opacity:0;transform:scale(.5)} 70%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes fade-up      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes jmx-bounce   { 0%{opacity:0;transform:scale(.4) translateY(20px)} 60%{transform:scale(1.2) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin         { to { transform: rotate(360deg) } }
        @keyframes float-particle { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.4)} }
        @keyframes shimmer      { 0%,100%{opacity:.4} 50%{opacity:1} }
        .pop  { animation: pop-in .7s cubic-bezier(.36,.07,.19,.97) both; }
        .fade { animation: fade-up .6s .3s ease both; }
      `}</style>

      {/* Background particles */}
      {status === 'success' && PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: cfg.glow,
        filter: 'blur(80px)', pointerEvents: 'none', transition: 'background 1s',
      }} />

      {/* Card */}
      <div style={{
        background: 'rgba(10,10,24,.9)',
        border: `1px solid ${cfg.color}30`,
        borderRadius: 24,
        padding: '3rem 2.5rem',
        maxWidth: 420, width: '100%',
        textAlign: 'center',
        boxShadow: `0 0 60px ${cfg.color}15`,
        backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 2,
      }}>
        {/* Club badge */}
        <div style={{ fontSize: '.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '2rem' }}>
          IIT Jammu Coding Club — Attendance System
        </div>

        {/* Icon */}
        <div className="pop" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {status === 'verifying' ? (
            <div style={{ width: 64, height: 64, border: '4px solid rgba(0,229,255,.15)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : cfg.icon}
        </div>

        {/* Title */}
        <h1 className="fade" style={{ color: cfg.color, fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 900, margin: '0 0 .5rem', textShadow: `0 0 30px ${cfg.color}60` }}>
          {cfg.title}
        </h1>

        {/* Subtitle */}
        <p className="fade" style={{ color: '#888', fontSize: '1rem', margin: '0 0 2rem', lineHeight: 1.5 }}>
          {cfg.sub}
        </p>

        {/* JmX earned badge */}
        {isSuccess && showJmx && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.7rem',
            background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.4)',
            borderRadius: 40, padding: '.75rem 1.75rem',
            animation: 'jmx-bounce .7s cubic-bezier(.36,.07,.19,.97) both',
            marginBottom: '2rem',
          }}>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
            <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.4rem' }}>+{jmxEarned} JmX</span>
            <span style={{ color: '#a0a0a0', fontSize: '.85rem' }}>earned</span>
          </div>
        )}

        {/* Already attended badge */}
        {isAlready && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.6rem',
            background: 'rgba(0,229,255,.07)', border: '1px solid rgba(0,229,255,.25)',
            borderRadius: 40, padding: '.65rem 1.5rem', marginBottom: '2rem',
          }}>
            <span style={{ color: '#00e5ff', fontWeight: 700, fontSize: '.9rem' }}>✓ Already recorded</span>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '0 0 1.5rem' }} />

        {/* Info footer */}
        <div style={{ fontSize: '.8rem', color: '#555', lineHeight: 1.6 }}>
          {isSuccess && <>Your attendance for <strong style={{ color: '#ccc' }}>{eventTitle}</strong> has been <strong style={{ color: '#00ff7f' }}>confirmed</strong>. You can close this tab.</>}
          {isAlready && <>You already checked in to this event. No duplicate entry was recorded.</>}
          {status === 'error' && <>
            The QR code may have expired (codes rotate every 30 seconds).<br/>
            <strong style={{ color: '#ff6b6b' }}>Ask the event host to display a fresh QR code and try again.</strong>
          </>}
          {status === 'verifying' && <>Contacting the attendance server…</>}
        </div>

        {/* Close tab button on success */}
        {(isSuccess || isAlready) && (
          <button
            onClick={() => window.close()}
            style={{
              marginTop: '1.5rem', padding: '.75rem 2rem',
              background: `linear-gradient(135deg,${cfg.color}22,${cfg.color}11)`,
              border: `1px solid ${cfg.color}40`,
              color: cfg.color, borderRadius: 10, cursor: 'pointer',
              fontWeight: 700, fontSize: '.9rem', fontFamily: 'Inter, sans-serif',
              transition: 'all .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${cfg.color}20`}
            onMouseLeave={e => e.currentTarget.style.background = `linear-gradient(135deg,${cfg.color}22,${cfg.color}11)`}
          >
            Close Tab
          </button>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: '2rem', color: '#333', fontSize: '.75rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        IIT Jammu Coding Club · Powered by JmX Attendance System
      </p>
    </div>
  )
}
