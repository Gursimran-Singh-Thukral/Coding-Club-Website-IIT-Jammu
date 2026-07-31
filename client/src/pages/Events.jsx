import React, { useState, useEffect } from 'react'
import Typewriter from '../components/Typewriter'

function Events() {
  const [activeTab, setActiveTab] = useState('tab-live')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Transition State for Tab switching particle explosions
  const [isTransitioning, setIsTransitioning] = useState(false)

  // State for Attendance Modal
  const [selectedEventForOtp, setSelectedEventForOtp] = useState(null)
  const [otpToken, setOtpToken] = useState('')
  const [validationMsg, setValidationMsg] = useState({ text: '', isSuccess: false })

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events from backend.')
        }
        const data = await response.json()
        setEvents(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleVerifyAttendance = async (e) => {
    e.preventDefault()
    if (!otpToken || !selectedEventForOtp) return

    try {
      const response = await fetch('/api/events/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventForOtp.id, token: otpToken })
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setValidationMsg({ text: `Attendance verified successfully!`, isSuccess: true })
        
        // Update local events list status
        setEvents(prev => prev.map(e => {
          if (e.id === selectedEventForOtp.id) {
            return { ...e, attended: true, status: 'past' }
          }
          return e
        }))
        setTimeout(() => {
          setSelectedEventForOtp(null)
          setOtpToken('')
          setValidationMsg({ text: '', isSuccess: false })
        }, 1500)
      } else {
        setValidationMsg({ text: result.message || 'Invalid token. Please try again.', isSuccess: false })
      }
    } catch (err) {
      setValidationMsg({ text: 'Error contacting verification node.', isSuccess: false })
    }
  }

  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST'
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setEvents(prev => prev.map(e => {
          if (e.id === eventId) {
            return { ...e, registered: true, registeredCount: result.registeredCount }
          }
          return e
        }))
        alert("Successfully registered!")
      } else {
        alert(result.error || "Failed to register.")
      }
    } catch (err) {
      alert("Error contacting registration server.")
    }
  }

  // Interactive Shatter Tab Switcher
  const handleTabClick = (newTab) => {
    if (newTab === activeTab || isTransitioning) return

    // Find all rendered event cards on the screen
    const cardElements = document.querySelectorAll('.event-card')
    const rects = Array.from(cardElements).map(el => {
      const r = el.getBoundingClientRect()
      return {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height
      }
    })

    // Dispatch the shatter trigger to the canvas
    window.dispatchEvent(new CustomEvent('cards-shatter', {
      detail: { rects }
    }))

    // Start DOM fade out
    setIsTransitioning(true)

    // Wait for the particles explosion, then swap content and fade back in
    setTimeout(() => {
      setActiveTab(newTab)
      setIsTransitioning(false)
    }, 250)
  }

  const handleCardMouseEnter = (e) => {
    window.dispatchEvent(new CustomEvent('card-hover', {
      detail: {
        active: true,
        element: e.currentTarget
      }
    }))
  }

  const handleCardMouseLeave = () => {
    window.dispatchEvent(new CustomEvent('card-hover', {
      detail: { active: false }
    }))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.25rem', color: 'var(--jmx-cyan)' }}>
        Accessing Event Node...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--jmx-red)', fontSize: '1.25rem' }}>
        Error: {error}
      </div>
    )
  }

  // Filter events by status
  const liveEvents = events.filter(e => e.status === 'live')
  const upcomingEvents = events.filter(e => e.status === 'upcoming')
  const pastEvents = events.filter(e => e.status === 'past')

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
        <Typewriter text="Event " speed={60} />
        <span className="text-gradient">
          <Typewriter text="Hub" speed={60} delay={400} />
        </span>
      </h1>
      <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>Register for workshops, view past attendance, and verify your presence at live events.</p>

      <div>
        {/* Top Nav Buttons — styled as JSX self-closing tags */}
        <div className="top-nav-buttons">
          {[
            { key: 'tab-live',   name: 'LiveNow',   count: liveEvents.length,    activeColor: '#ff4444' },
            { key: 'tab-future', name: 'Upcoming',  count: upcomingEvents.length, activeColor: '#00e5ff' },
            { key: 'tab-past',   name: 'Past',      count: pastEvents.length,    activeColor: '#a855f7' },
          ].map(tab => {
            const isActive = activeTab === tab.key
            const col = isActive ? tab.activeColor : '#444'
            return (
              <button
                key={tab.key}
                className={`top-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.key)}
                style={{
                  fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                  fontSize: '.88rem',
                  letterSpacing: '-.01em',
                  padding: '.5rem 1.1rem',
                  background: isActive ? `${tab.activeColor}12` : 'transparent',
                  border: `1px solid ${isActive ? tab.activeColor + '40' : 'rgba(255,255,255,.07)'}`,
                  borderRadius: 10,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  boxShadow: isActive ? `0 0 14px ${tab.activeColor}30` : 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 0,
                }}
              >
                <span style={{ color: isActive ? tab.activeColor : '#3a3a3a', fontWeight: 700, transition: 'color .2s' }}>&lt;</span>
                <span style={{ color: isActive ? '#fff' : '#555', margin: '0 .12rem', transition: 'color .2s' }}>{tab.name}</span>
                <span style={{ color: isActive ? tab.activeColor : '#3a3a3a', fontWeight: 700, transition: 'color .2s' }}>/&gt;</span>
              </button>
            )
          })}
        </div>

        {/* Content Area with smooth fade transition */}
        <div style={{ 
          marginTop: '2rem',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.25s ease-in-out'
        }}>
          
          {/* LIVE EVENTS TAB */}
          {activeTab === 'tab-live' && (
            <div className="main-tab-panel active-content">
              {liveEvents.length === 0 ? (
                <p style={{ color: '#a0a0a0', textAlign: 'center', marginTop: '2rem' }}>No live sessions running right now.</p>
              ) : (
                <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                  {liveEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="event-card interactive-hover-card"
                      onMouseEnter={handleCardMouseEnter}
                      onMouseLeave={handleCardMouseLeave}
                      onClick={() => { setSelectedEventForOtp(event); }}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={event.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"} alt={event.title} className="event-card-img" />
                      <div className="event-card-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '1.25rem' }}>{event.title}</h3>
                          <span className="status-badge status-live" style={{ fontSize: '0.7rem' }}>LIVE NOW</span>
                        </div>
                        <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{event.description}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span style={{ color: '#a0a0a0', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--jmx-cyan)' }}>Session Active</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FUTURE EVENTS TAB */}
          {activeTab === 'tab-future' && (
            <div className="main-tab-panel active-content">
              {upcomingEvents.length === 0 ? (
                <p style={{ color: '#a0a0a0', textAlign: 'center', marginTop: '2rem' }}>No upcoming events scheduled.</p>
              ) : (
                <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                  {upcomingEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="event-card interactive-hover-card"
                      onMouseEnter={handleCardMouseEnter}
                      onMouseLeave={handleCardMouseLeave}
                    >
                      <img src={event.coverImage || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80"} alt={event.title} className="event-card-img" />
                      <div className="event-card-content">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{event.title}</h3>
                        <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '1rem' }}>{event.dateLabel} • {event.location || 'MCC'}</p>
                        <p style={{ color: '#ccc', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>{event.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span style={{ color: '#888', fontSize: '0.85rem' }}>{event.registeredCount || 0} Registered</span>
                          {event.registered ? (
                            <span style={{ color: 'var(--jmx-emerald)', fontWeight: 600, fontSize: '0.95rem' }}>✓ Registered</span>
                          ) : (
                            <button onClick={() => handleRegister(event.id)} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>Register Now</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PAST EVENTS TAB */}
          {activeTab === 'tab-past' && (
            <div className="main-tab-panel active-content">
              {pastEvents.length === 0 ? (
                <p style={{ color: '#a0a0a0', textAlign: 'center', marginTop: '2rem' }}>No history of past events found.</p>
              ) : (
                <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                  {pastEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="event-card interactive-hover-card"
                      onMouseEnter={handleCardMouseEnter}
                      onMouseLeave={handleCardMouseLeave}
                    >
                      <img 
                        src={event.coverImage || "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80"} 
                        alt={event.title} 
                        className="event-card-img" 
                        style={{ filter: event.attended ? 'grayscale(0.5)' : 'grayscale(1)' }} 
                      />
                      <div className="event-card-content" style={{ opacity: event.attended ? 1 : 0.7 }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{event.title}</h3>
                        <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{event.dateLabel}</p>
                        <div style={{ marginTop: 'auto' }}>
                          {event.attended ? (
                            <span style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'rgba(0, 255, 127, 0.1)', color: 'var(--jmx-emerald)', border: '1px solid var(--jmx-emerald)', borderRadius: '20px', fontWeight: 600 }}>
                              ✅ Attended
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '20px', fontWeight: 600 }}>
                              ❌ Missed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Verification Modal */}
      {selectedEventForOtp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ padding: '2.5rem', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Attendance Verification</h3>
              <button 
                onClick={() => { setSelectedEventForOtp(null); setOtpToken(''); setValidationMsg({ text: '', isSuccess: false }); }}
                style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0 }}>
              Enter the dynamic 6-digit code shown on the projector screen for <strong>{selectedEventForOtp.title}</strong>.
            </p>

            <form onSubmit={handleVerifyAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input 
                type="text" 
                maxLength={6} 
                placeholder="------" 
                className="otp-input" 
                style={{ width: '100%', fontSize: '2.5rem', padding: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.5)' }}
                value={otpToken} 
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))} 
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.8rem' }}>Confirm Attendance</button>
            </form>

            {validationMsg.text && (
              <div style={{ 
                fontSize: '0.95rem', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                background: validationMsg.isSuccess ? 'rgba(0, 255, 127, 0.1)' : 'rgba(255, 68, 68, 0.1)', 
                color: validationMsg.isSuccess ? 'var(--jmx-emerald)' : '#ff4444', 
                border: `1px solid ${validationMsg.isSuccess ? 'var(--jmx-emerald)' : '#ff4444'}`,
                textAlign: 'center'
              }}>
                {validationMsg.text}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default Events
