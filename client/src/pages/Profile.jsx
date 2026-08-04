import React, { useState, useEffect, useRef } from 'react'
import Typewriter from '../components/Typewriter'
import gsap from 'gsap'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mouse position ref for canvas liquid line calculations
  const containerRef = useRef(null)
  const lineCanvasRef = useRef(null)
  const mousePosRef = useRef({ x: -1000, y: -1000 })

  // Trigger entrance animations when content finishes loading
  useEffect(() => {
    if (!loading && !error) {
      gsap.fromTo('.fade-in-up',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', overwrite: 'auto' }
      )
    }
  }, [loading, error])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Failed to retrieve profile data.')
      }
      const data = await response.json()
      setProfile(data)
    } catch (err) {
      // Fallback mock profile data for standalone front-end rendering
      setProfile({
        name: "Rohit Sharma",
        yearLabel: "Second Year",
        branch: "B.Tech Electrical",
        jmxScore: 450,
        globalRank: 128,
        avatar: "https://i.pravatar.cc/300?img=5",
        stats: {
          eventsAttended: 6,
          hackathonPodiums: 1,
          leetcodeSolved: 142,
          codeforcesRating: 'Unrated'
        },
        accounts: {
          github: "rohit_dev",
          leetcode: "rohit_lc",
          codeforces: "",
          linkedin: ""
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Canvas guitar-string pluck & oscillation physics animation loop
  useEffect(() => {
    if (loading || error || !profile) return

    const canvas = lineCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    // Set layout resolution
    const w = canvas.width = 60
    const parentHeight = canvas.parentElement.clientHeight
    const h = canvas.height = parentHeight - 120
    
    // Create node points along the vertical string line with velocity states
    const numPoints = 40
    const points = []
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: w / 2,
        y: (i / (numPoints - 1)) * h,
        vx: 0 // Velocity state for harmonic oscillation
      })
    }

    // Physics parameters for a plucked guitar string
    const springK = 0.035 // Spring tension constant (lower is looser/wiggles longer)
    const damping = 0.965 // Damping friction multiplier (close to 1 means wiggles for a long time)

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      // Sleek neon solid cyan stroke with high glow blur
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.95)'
      ctx.lineWidth = 2.5
      ctx.shadowBlur = 12
      ctx.shadowColor = 'rgba(0, 240, 255, 0.85)'

      points.forEach((p, idx) => {
        // Base resting line x coordinate
        const targetX = w / 2
        
        // Calculate mouse interaction
        if (mousePosRef.current.x !== -1000) {
          // Adjust mouse coordinates relative to the canvas offset (left: 31px, top: 72px)
          const mx = mousePosRef.current.x - 31
          const my = mousePosRef.current.y - 72
          
          const dx = targetX - mx
          const dy = p.y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 75) {
            const force = (75 - dist) / 75
            // Pluck: Add acceleration velocity pushing the node away from the mouse
            p.vx += (dx > 0 ? 1 : -1) * force * 1.8
          }
        }

        // Hooke's Law: Acceleration towards resting position
        const acceleration = (targetX - p.x) * springK
        p.vx += acceleration
        p.vx *= damping // Apply air resistance damping
        p.x += p.vx // Update coordinate position

        if (idx === 0) {
          ctx.moveTo(p.x, p.y)
        } else {
          // Smooth quadratic curve joins
          const prev = points[idx - 1]
          const xc = (p.x + prev.x) / 2
          const yc = (p.y + prev.y) / 2
          ctx.quadraticCurveTo(prev.x, prev.y, xc, yc)
        }
      })
      
      ctx.stroke()
      ctx.shadowBlur = 0 // Reset shadows
      
      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animId)
  }, [loading, error, profile])

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -1000, y: -1000 }
  }

  const handleBindAccount = async (platformName) => {
    const handle = prompt(`Enter your ${platformName} username/handle:`)
    if (!handle) return

    try {
      const response = await fetch('/api/profile/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName.toLowerCase(), handle })
      })
      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        alert(`${platformName} account successfully linked!`)
      } else {
        alert('Failed to bind account. Please try again.')
      }
    } catch (err) {
      alert('Error connecting to backend services.')
    }
  }

  // Helper to render glowing node indicator dots
  const renderConnectionDot = (isConnected) => (
    <div style={{
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: isConnected ? 'var(--jmx-emerald)' : '#333339',
      boxShadow: isConnected ? '0 0 10px var(--jmx-emerald), 0 0 4px var(--jmx-emerald)' : 'none',
      marginRight: '0.75rem',
      flexShrink: 0,
      zIndex: 2 // Make sure the dot sits on top of the liquid line
    }} />
  )

  return (
    <main style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingTop: '4.5rem', 
      paddingBottom: '1rem',
      overflow: 'hidden',
      background: '#020205'
    }}>
      <div className="fade-in-up" style={{
        maxWidth: '1100px',
        width: '90%',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1.15fr',
        gap: '2.5rem',
        alignItems: 'stretch'
      }}>
        
        {/* Left Column: Profile Card & Accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Card */}
          <div className="glass-panel" style={{ 
            padding: '1.75rem 2rem', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div className="avatar-container" style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'var(--jmx-cyan)',
              padding: '3px',
              boxShadow: '0 4px 15px rgba(0, 229, 255, 0.15)',
              flexShrink: 0
            }}>
              <img src={profile?.avatar || "https://i.pravatar.cc/300?img=5"} alt="Student Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#05050a' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.15rem 0', fontFamily: 'var(--font-title)', color: '#ffffff' }}>
                {profile?.name}
              </h1>
              <p style={{ color: '#a0a0a0', fontSize: '0.95rem', margin: '0 0 0.75rem 0', fontWeight: 500 }}>{profile?.yearLabel || ""} • {profile?.branch || ""}</p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out?")) {
                      window.location.href = '/'
                    }
                  }}
                  className="btn-outline" 
                  style={{ 
                    padding: '0.25rem 0.75rem', 
                    fontSize: '0.8rem', 
                    borderRadius: '8px', 
                    borderColor: 'rgba(255, 68, 68, 0.4)', 
                    color: '#ff4444',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = '#ff4444';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.4)';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Connected Accounts Panel with Liquid interactive canvas */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="glass-panel" 
            style={{ 
              padding: '1.75rem 2rem', 
              border: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(2, 2, 5, 0.25)',
              borderRadius: '16px',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#ffffff' }}>
              Connected Platforms
            </h3>

            {/* Interactive Liquid Connecting Path */}
            {!loading && !error && (
              <canvas 
                ref={lineCanvasRef}
                style={{
                  position: 'absolute',
                  left: '31px', // Centered alignment overlaying with connection dot offsets
                  top: '72px',
                  width: '60px',
                  height: 'calc(100% - 120px)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 2 }}>
              {/* GitHub */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(5, 5, 10, 0.6)' }}>
                {renderConnectionDot(!!profile?.accounts?.github)}
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#181b20', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 700, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center', flexShrink: 0, zIndex: 3 }}>GH</div>
                <div style={{ flexGrow: 1, minWidth: 0, zIndex: 3 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>GitHub</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.accounts?.github ? `@${profile.accounts.github}` : 'Not Connected'}</p>
                </div>
                {profile?.accounts?.github ? (
                  <span style={{ color: 'var(--jmx-emerald)', fontSize: '0.75rem', fontWeight: 700, zIndex: 3 }}>Active</span>
                ) : (
                  <button onClick={() => handleBindAccount('GitHub')} className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px', zIndex: 3 }}>Bind</button>
                )}
              </div>

              {/* LinkedIn */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(5, 5, 10, 0.6)' }}>
                {renderConnectionDot(!!profile?.accounts?.linkedin)}
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#0077b5', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 700, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', flexShrink: 0, color: '#fff', zIndex: 3 }}>IN</div>
                <div style={{ flexGrow: 1, minWidth: 0, zIndex: 3 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>LinkedIn</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.accounts?.linkedin ? `@${profile.accounts.linkedin}` : 'Not Connected'}</p>
                </div>
                {profile?.accounts?.linkedin ? (
                  <span style={{ color: 'var(--jmx-emerald)', fontSize: '0.75rem', fontWeight: 700, zIndex: 3 }}>Active</span>
                ) : (
                  <button onClick={() => handleBindAccount('LinkedIn')} className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px', zIndex: 3 }}>Bind</button>
                )}
              </div>

              {/* LeetCode */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(5, 5, 10, 0.6)' }}>
                {renderConnectionDot(!!profile?.accounts?.leetcode)}
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f89f1b', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 700, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', flexShrink: 0, color: '#fff', zIndex: 3 }}>LC</div>
                <div style={{ flexGrow: 1, minWidth: 0, zIndex: 3 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>LeetCode</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.accounts?.leetcode ? `@${profile.accounts.leetcode}` : 'Not Connected'}</p>
                </div>
                {profile?.accounts?.leetcode ? (
                  <span style={{ color: 'var(--jmx-emerald)', fontSize: '0.75rem', fontWeight: 700, zIndex: 3 }}>Active</span>
                ) : (
                  <button onClick={() => handleBindAccount('LeetCode')} className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px', zIndex: 3 }}>Bind</button>
                )}
              </div>

              {/* Codeforces */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(5, 5, 10, 0.6)' }}>
                {renderConnectionDot(!!profile?.accounts?.codeforces)}
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#445f9d', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 700, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', flexShrink: 0, color: '#fff', zIndex: 3 }}>CF</div>
                <div style={{ flexGrow: 1, minWidth: 0, zIndex: 3 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Codeforces</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.accounts?.codeforces ? `@${profile.accounts.codeforces}` : 'Not Connected'}</p>
                </div>
                {profile?.accounts?.codeforces ? (
                  <span style={{ color: 'var(--jmx-emerald)', fontSize: '0.75rem', fontWeight: 700, zIndex: 3 }}>Active</span>
                ) : (
                  <button onClick={() => handleBindAccount('Codeforces')} className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px', zIndex: 3 }}>Bind</button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Sleek 2x2 Stats Dashboard */}
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: '1.25rem' }}>
          
          <div style={{ paddingLeft: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#ffffff' }}>
              Platform Performance
            </h3>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Real-time statistics across academic & programming activities.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '1.25rem'
          }}>
            
            {/* Events Card */}
            <div className="glass-card" style={{ 
              padding: '1.5rem', 
              borderRadius: '14px',
              border: '1px solid rgba(0, 240, 255, 0.08)',
              background: 'rgba(255,255,255,0.01)',
              boxShadow: '0 4px 20px rgba(0, 240, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 240, 255, 0.12)'
              e.currentTarget.style.borderColor = 'var(--jmx-cyan)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 240, 255, 0.02)'
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <h4 style={{ color: '#888', margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>Events Attended</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--jmx-cyan)', margin: 0, fontFamily: 'var(--font-title)' }}>{profile?.stats?.eventsAttended || 0}</p>
            </div>

            {/* Hackathon Podiums Card */}
            <div className="glass-card" style={{ 
              padding: '1.5rem', 
              borderRadius: '14px',
              border: '1px solid rgba(138, 43, 226, 0.08)',
              background: 'rgba(255,255,255,0.01)',
              boxShadow: '0 4px 20px rgba(138, 43, 226, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(138, 43, 226, 0.12)'
              e.currentTarget.style.borderColor = 'var(--jmx-purple)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(138, 43, 226, 0.02)'
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <h4 style={{ color: '#888', margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>Hackathons Won</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--jmx-purple)', margin: 0, fontFamily: 'var(--font-title)' }}>{profile?.stats?.hackathonPodiums || 0}</p>
            </div>

            {/* LeetCode Solved Card */}
            <div className="glass-card" style={{ 
              padding: '1.5rem', 
              borderRadius: '14px',
              border: '1px solid rgba(248, 159, 27, 0.08)',
              background: 'rgba(255,255,255,0.01)',
              boxShadow: '0 4px 20px rgba(248, 159, 27, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(248, 159, 27, 0.12)'
              e.currentTarget.style.borderColor = '#f89f1b'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(248, 159, 27, 0.02)'
              e.currentTarget.style.borderColor = 'rgba(248, 159, 27, 0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <h4 style={{ color: '#888', margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>LeetCode Solved</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f89f1b', margin: 0, fontFamily: 'var(--font-title)' }}>{profile?.stats?.leetcodeSolved || 0}</p>
            </div>

            {/* Codeforces Rating Card */}
            <div className="glass-card" style={{ 
              padding: '1.5rem', 
              borderRadius: '14px',
              border: '1px solid rgba(68, 95, 157, 0.08)',
              background: 'rgba(255,255,255,0.01)',
              boxShadow: '0 4px 20px rgba(68, 95, 157, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(68, 95, 157, 0.12)'
              e.currentTarget.style.borderColor = '#445f9d'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(68, 95, 157, 0.02)'
              e.currentTarget.style.borderColor = 'rgba(68, 95, 157, 0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <h4 style={{ color: '#888', margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>CF Rating</h4>
              <p style={{ fontSize: '2.3rem', fontWeight: 800, color: '#445f9d', margin: 0, fontFamily: 'var(--font-title)' }}>{profile?.stats?.codeforcesRating || 'Unrated'}</p>
            </div>

          </div>

        </div>

      </div>
    </main>
  )
}

export default Profile
