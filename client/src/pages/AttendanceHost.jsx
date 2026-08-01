import React, { useState, useEffect, useRef, useCallback } from 'react'

// ── AttendanceHost ──────────────────────────────────────────────────────────
// Opened in a new browser tab by the admin.
// Shows a rotating QR code that refreshes every 30 seconds.
// Students scan it and are taken to /attend/:token?eid=<eventId>
// ───────────────────────────────────────────────────────────────────────────

function buildQRImageUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(text)}&bgcolor=0a0a14&color=00e5ff&qzone=2&format=png`
}

// Animated countdown ring SVG
function RingTimer({ seconds, total = 30 }) {
  const r = 60
  const circ = 2 * Math.PI * r
  const progress = (seconds / total) * circ
  const hue = Math.round((seconds / total) * 120) // green→red

  return (
    <svg width={160} height={160} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={6} />
      <circle
        cx={80} cy={80} r={r} fill="none"
        stroke={`hsl(${hue},100%,55%)`}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circ}`}
        style={{ transition: 'stroke-dasharray 1s linear, stroke .5s' }}
      />
    </svg>
  )
}

export default function AttendanceHost() {
  const [eventId]          = useState(() => {
    const match = window.location.pathname.match(/\/admin\/attendance\/(\d+)/)
    return match ? parseInt(match[1]) : null
  })
  const [eventTitle, setEventTitle] = useState('Loading…')
  const [qrUrl, setQrUrl]           = useState('')
  const [token, setToken]           = useState('')
  const [secsLeft, setSecsLeft]     = useState(30)
  const [attendeeCount, setAttendeeCount] = useState(0)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const intervalRef = useRef(null)
  const tickRef     = useRef(null)

  const fetchToken = useCallback(async () => {
    if (!eventId) return
    try {
      const res = await fetch(`/api/admin/events/${eventId}/qrtoken`)
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to generate QR token.')
        return
      }
      const data = await res.json()
      setEventTitle(data.eventTitle)
      setToken(data.token)
      setQrUrl(buildQRImageUrl(data.qrUrl))
      setLoading(false)
      // Sync countdown to actual window
      const ms = data.msRemaining || 30000
      setSecsLeft(Math.ceil(ms / 1000))
    } catch (e) {
      setError('Network error — is the server running?')
    }
  }, [eventId])

  // Initial fetch + re-fetch every 30s
  useEffect(() => {
    fetchToken()
    intervalRef.current = setInterval(fetchToken, 30000)
    return () => clearInterval(intervalRef.current)
  }, [fetchToken])

  // Client-side countdown tick
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setSecsLeft(prev => {
        if (prev <= 1) return 30
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [])

  // Poll attendee count every 5s
  useEffect(() => {
    if (!eventId) return
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/events')
        if (res.ok) {
          const evts = await res.json()
          const ev = evts.find(e => e.id === eventId)
          if (ev) setAttendeeCount((ev.attendees || []).length)
        }
      } catch {}
    }, 5000)
    return () => clearInterval(poll)
  }, [eventId])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#060610', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#ff4444', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '.5rem' }}>Error</h2>
          <p style={{ color: '#888' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#060610 0%,#0a0a1e 60%,#0d0818 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: '2rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 30px rgba(0,229,255,.4),0 0 80px rgba(0,229,255,.1)} 50%{box-shadow:0 0 50px rgba(0,229,255,.7),0 0 100px rgba(0,229,255,.2)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes scan-line { 0%{top:0} 100%{top:100%} }
        @keyframes count-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .qr-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
        .float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* Header badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '2.5rem' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4444', boxShadow: '0 0 10px #ff4444', display: 'inline-block', animation: 'pulse-glow 1.4s infinite' }} />
        <span style={{ color: '#ff6b6b', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '.12em' }}>Attendance Session — LIVE</span>
      </div>

      {/* Event title */}
      <h1 style={{ color: '#fff', fontSize: 'clamp(1.4rem,4vw,2.2rem)', fontWeight: 800, textAlign: 'center', marginBottom: '.5rem', margin: '0 0 .5rem' }}>
        {eventTitle}
      </h1>
      <p style={{ color: '#666', fontSize: '.9rem', marginBottom: '3rem', textAlign: 'center' }}>
        Display this screen — students scan to mark attendance automatically
      </p>

      {/* QR Panel */}
      <div className="float" style={{ position: 'relative', marginBottom: '2.5rem' }}>
        {/* Countdown ring */}
        <div style={{ position: 'absolute', width: 160, height: 160, top: -20, left: -20, zIndex: 2 }}>
          <RingTimer seconds={secsLeft} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(0deg)', textAlign: 'center', fontSize: '1.3rem', fontWeight: 800, color: secsLeft <= 5 ? '#ff4444' : '#fff', lineHeight: 1 }}>
            {/* secs inside ring — positioned absolutely over svg */}
          </div>
        </div>

        {/* QR code itself */}
        <div className="qr-glow" style={{
          background: 'rgba(0,229,255,.06)',
          border: '2px solid rgba(0,229,255,.4)',
          borderRadius: 20,
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 48, height: 48, border: '3px solid rgba(0,229,255,.2)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <img key={token} src={qrUrl} alt="Attendance QR" width={280} height={280}
              style={{ display: 'block', borderRadius: 10 }} />
          )}

          {/* Animated scanner line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg,transparent,#00e5ff,transparent)',
            boxShadow: '0 0 10px #00e5ff',
            animation: 'scan-line 2.5s linear infinite',
          }} />
        </div>
      </div>

      {/* Countdown + token info */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Big countdown */}
        <div style={{ textAlign: 'center', position: 'relative', width: 120, height: 120 }}>
          <RingTimer seconds={secsLeft} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: secsLeft <= 5 ? '#ff4444' : '#fff',
            transition: 'color .3s',
          }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{secsLeft}</span>
            <span style={{ fontSize: '.65rem', color: '#666', textTransform: 'uppercase', letterSpacing: '.08em' }}>seconds</span>
          </div>
        </div>

        {/* Token text */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.4rem' }}>Current Token</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#00e5ff', background: 'rgba(0,229,255,.07)', border: '1px solid rgba(0,229,255,.25)', padding: '.5rem 1rem', borderRadius: 8, wordBreak: 'break-all', maxWidth: 260 }}>
            {token.substring(0, 24)}…
          </div>
          <div style={{ fontSize: '.72rem', color: '#555', marginTop: '.4rem' }}>Refreshes automatically</div>
        </div>
      </div>

      {/* Attendee counter */}
      <div style={{
        background: 'rgba(0,255,127,.07)',
        border: '1px solid rgba(0,255,127,.3)',
        borderRadius: 16, padding: '1rem 2.5rem',
        textAlign: 'center',
        animation: 'count-pulse 2s ease-in-out infinite',
      }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#00ff7f', lineHeight: 1 }}>{attendeeCount}</div>
        <div style={{ fontSize: '.82rem', color: '#00ff7f88', marginTop: '.3rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>Students Checked In</div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600 }}>
        {['Students point camera at QR code', 'Browser opens attendance confirm page', 'Attendance recorded automatically'].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', color: '#666', fontSize: '.82rem' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.3)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            {step}
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
