import React, { useState, useEffect, useRef } from 'react'
import Typewriter from '../components/Typewriter'
import gsap from 'gsap'

function AdminProfile() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Control Panel active operation selection
  const [activeOperation, setActiveOperation] = useState('create-event') // 'create-event', 'hire', 'transfer', 'showcase'

  // Input focus tracking states for glowing styles
  const [focusedInput, setFocusedInput] = useState(null)

  // Hidden inputs references for file triggers
  const avatarInputRef = useRef(null)

  // Form states (Recruit simplified; Shift Duty kept same; Showcase added)
  const [eventForm, setEventForm] = useState({ 
    title: '', 
    type: 'Workshop', 
    date: '', 
    time: '', 
    location: '', 
    jmxPoints: '50', 
    coverImage: '', // Base64 data URL
    description: '' 
  })
  const [hireForm, setHireForm] = useState({ username: '', role: 'Domain Specialist', domain: 'Web Dev', briefRole: '' })
  const [transferForm, setTransferForm] = useState({ targetUsername: '', bio: '', github: '', linkedin: '' })
  const [showcaseForm, setShowcaseForm] = useState({
    title: '',
    username: '',
    techStack: '',
    description: '',
    coverImage: '', // Base64 data URL
    github: ''
  })

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

  const fetchAdminProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/profile')
      if (!response.ok) {
        throw new Error('Failed to retrieve administrator profile.')
      }
      const data = await response.json()
      setAdmin(data)
    } catch (err) {
      // Fallback mock profile data for standalone admin panel rendering
      setAdmin({
        name: "Aryan Kumar",
        role: "Technical Secretary",
        domain: "General",
        jmxScore: 1250,
        globalRank: 42,
        avatar: "https://i.pravatar.cc/300?img=12",
        stats: {
          eventsAttended: 14,
          hackathonPodiums: 2,
          leetcodeSolved: 342,
          codeforcesRating: 1450
        },
        accounts: {
          github: "aryancodes",
          leetcode: "aryan_lc",
          codeforces: "",
          linkedin: ""
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminProfile()
  }, [])

  // Canvas guitar-string pluck & oscillation physics animation loop
  useEffect(() => {
    if (loading || error || !admin) return

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

    const springK = 0.035
    const damping = 0.965

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      // Sleek neon solid cyan stroke with high glow blur
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.95)'
      ctx.lineWidth = 2.5
      ctx.shadowBlur = 12
      ctx.shadowColor = 'rgba(0, 240, 255, 0.85)'

      points.forEach((p, idx) => {
        const targetX = w / 2
        
        // Calculate mouse interaction
        if (mousePosRef.current.x !== -1000) {
          const mx = mousePosRef.current.x - 31
          const my = mousePosRef.current.y - 72
          
          const dx = targetX - mx
          const dy = p.y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 75) {
            const force = (75 - dist) / 75
            p.vx += (dx > 0 ? 1 : -1) * force * 1.8
          }
        }

        const acceleration = (targetX - p.x) * springK
        p.vx += acceleration
        p.vx *= damping
        p.x += p.vx

        if (idx === 0) {
          ctx.moveTo(p.x, p.y)
        } else {
          const prev = points[idx - 1]
          const xc = (p.x + prev.x) / 2
          const yc = (p.y + prev.y) / 2
          ctx.quadraticCurveTo(prev.x, prev.y, xc, yc)
        }
      })
      
      ctx.stroke()
      ctx.shadowBlur = 0
      
      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animId)
  }, [loading, error, admin])

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
        fetchAdminProfile()
        alert(`${platformName} account successfully linked!`)
      } else {
        alert('Failed to bind account.')
      }
    } catch (err) {
      alert('Error connecting to backend services.')
    }
  }

  // Format Time representation from HTML5 Picker format "HH:MM" -> "H:MM AM/PM"
  const formatTime12h = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const formattedHours = h % 12 || 12
    return `${formattedHours}:${minutes} ${ampm}`
  }

  // Format Date representation from HTML5 picker format "YYYY-MM-DD" -> "MMM DD"
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return 'TBD'
    const dateObj = new Date(dateStr)
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  }

  // Handle Event Local Cover Photo upload
  const handleEventCoverUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setEventForm(prev => ({ ...prev, coverImage: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  // Handle Showcase Project Local Photo upload
  const handleShowcaseCoverUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setShowcaseForm(prev => ({ ...prev, coverImage: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  // Handle Changing Profile Avatar photo locally
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Img = reader.result
      try {
        const response = await fetch('/api/admin/profile/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64Img })
        })
        if (response.ok) {
          const updated = await response.json()
          setAdmin(updated)
          alert('Profile picture successfully updated!')
        } else {
          alert('Failed to update avatar photo.')
        }
      } catch (err) {
        alert('Error uploading avatar image.')
      }
    }
    reader.readAsDataURL(file)
  }

  // Create Event Submit
  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.time) {
      alert('Please fill out the event title, description, date and time.')
      return
    }

    const formattedDate = formatDateLabel(eventForm.date)
    const formattedTime = formatTime12h(eventForm.time)
    const combinedDateLabel = `${formattedDate} • ${formattedTime}`

    try {
      const response = await fetch('/api/admin/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventForm.title,
          type: eventForm.type,
          dateLabel: combinedDateLabel,
          location: eventForm.location,
          jmxPoints: eventForm.jmxPoints,
          coverImage: eventForm.coverImage,
          description: eventForm.description
        })
      })
      const result = await response.json()
      if (response.ok && result.success) {
        alert(`Successfully created new event: "${result.event.title}"!`)
        setEventForm({ 
          title: '', 
          type: 'Workshop', 
          date: '', 
          time: '', 
          location: '', 
          jmxPoints: '50', 
          coverImage: '',
          description: '' 
        })
      } else {
        alert(result.error || 'Failed to create event.')
      }
    } catch (err) {
      alert('Error connecting to events database.')
    }
  }

  // Hire Co-Member Submit
  const handleHireMember = async (e) => {
    e.preventDefault()
    if (!hireForm.username || !hireForm.briefRole) {
      alert('Please enter both the username and brief role of the new recruit.')
      return
    }

    try {
      const response = await fetch('/api/admin/members/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hireForm)
      })
      const result = await response.json()
      if (response.ok && result.success) {
        alert(`Successfully recruited ${result.member.name} as a ${result.member.role}!`)
        setHireForm({ username: '', role: 'Domain Specialist', domain: 'Web Dev', briefRole: '' })
      } else {
        alert(result.error || 'Failed to hire member.')
      }
    } catch (err) {
      alert('Error connecting to recruiting portal.')
    }
  }

  // Showcase Project Submit
  const handleCreateShowcase = async (e) => {
    e.preventDefault()
    if (!showcaseForm.title || !showcaseForm.username || !showcaseForm.description) {
      alert('Please enter a project title, student username, and brief description.')
      return
    }

    try {
      const response = await fetch('/api/admin/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showcaseForm)
      })
      const result = await response.json()
      if (response.ok && result.success) {
        alert(`Successfully showcased project: "${result.project.title}" by @${result.project.username}!`)
        setShowcaseForm({ title: '', username: '', techStack: '', description: '', coverImage: '', github: '' })
      } else {
        alert(result.error || 'Failed to showcase project.')
      }
    } catch (err) {
      alert('Error connecting to project database.')
    }
  }

  // Transfer own job Submit
  const handleTransferJob = async (e) => {
    e.preventDefault()
    if (!transferForm.targetUsername) {
      alert('Please enter the target username.')
      return
    }

    const confirmTransfer = window.confirm(`WARNING: This will permanently transfer your role "${admin.role}" to target username "${transferForm.targetUsername}". You will lose administrative access. Proceed?`)
    if (!confirmTransfer) return

    try {
      const response = await fetch('/api/admin/jobs/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferForm)
      })
      const result = await response.json()
      if (response.ok && result.success) {
        alert(result.message)
        fetchAdminProfile()
        setTransferForm({ targetUsername: '', bio: '', github: '', linkedin: '' })
      } else {
        alert(result.error || 'Failed to transfer job.')
      }
    } catch (err) {
      alert('Error contacting administrative shift server.')
    }
  }

  const renderConnectionDot = (isConnected) => (
    <div style={{
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: isConnected ? 'var(--jmx-emerald)' : '#333339',
      boxShadow: isConnected ? '0 0 10px var(--jmx-emerald), 0 0 4px var(--jmx-emerald)' : 'none',
      marginRight: '0.75rem',
      flexShrink: 0,
      zIndex: 2
    }} />
  )

  const getInputStyles = (fieldId, themeColor = 'var(--jmx-cyan)') => {
    const isFocused = focusedInput === fieldId
    return {
      padding: '0.5rem 0.65rem', 
      background: 'rgba(5, 5, 10, 0.75)', 
      border: `1px solid ${isFocused ? themeColor : 'rgba(255, 255, 255, 0.08)'}`, 
      color: '#fff', 
      borderRadius: '6px', 
      fontSize: '0.8rem',
      outline: 'none',
      width: '100%',
      boxShadow: isFocused 
        ? `0 0 8px rgba(${themeColor === 'var(--jmx-cyan)' 
            ? '0, 240, 255' 
            : themeColor === 'var(--jmx-emerald)' 
              ? '0, 255, 127' 
              : themeColor === 'var(--jmx-yellow)' 
                ? '255, 204, 0' 
                : '255, 68, 68'}, 0.25)` 
        : 'none',
      transition: 'all 0.25s ease-in-out'
    }
  }

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
      {/* Hidden file input for avatar uploading */}
      <input 
        type="file" 
        ref={avatarInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleAvatarChange} 
      />

      <div className="fade-in-up admin-profile-grid" style={{
        maxWidth: '1200px',
        width: '94%',
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '2.5rem',
        alignItems: 'stretch'
      }}>
        
        {/* Left Column: Admin Profile Info & Accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Card (Clickable Avatar to change profile photo) */}
          <div className="glass-panel" style={{ 
            padding: '1.5rem 2rem', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="avatar-container" 
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'var(--jmx-cyan)',
                padding: '3px',
                boxShadow: '0 4px 15px rgba(0, 229, 255, 0.15)',
                flexShrink: 0,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              title="Click to change profile avatar"
            >
              <img src={admin?.avatar || "https://i.pravatar.cc/300?img=12"} alt="Admin Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#05050a' }} />
              {/* Overlay edit banner */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: '0.65rem',
                textAlign: 'center',
                padding: '2px 0',
                opacity: 0,
                transition: 'opacity 0.2s'
              }}
              className="avatar-overlay"
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                EDIT
              </div>
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.15rem 0', fontFamily: 'var(--font-title)', color: '#ffffff' }}>
                {admin?.name}
              </h1>
              <p style={{ color: 'var(--jmx-cyan)', fontSize: '0.95rem', margin: '0 0 0.75rem 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05rem' }}>
                {admin?.role}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out of the admin panel?")) {
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
                    e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)'
                    e.currentTarget.style.borderColor = '#ff4444'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.4)'
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
              padding: '1.5rem 2rem', 
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
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#ffffff' }}>
              Connected Platforms
            </h3>

            {/* Interactive Liquid Connecting Path */}
            {!loading && !error && (
              <canvas 
                ref={lineCanvasRef}
                style={{
                  position: 'absolute',
                  left: '31px', // Centered alignment overlaying with connection dot offsets
                  top: '68px',
                  width: '60px',
                  height: 'calc(100% - 110px)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', position: 'relative', zIndex: 2 }}>
              {/* GitHub */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(5, 5, 10, 0.6)' }}>
                {renderConnectionDot(!!admin?.accounts?.github)}
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#181b20', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 700, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center', flexShrink: 0, zIndex: 3 }}>GH</div>
                <div style={{ flexGrow: 1, minWidth: 0, zIndex: 3 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>GitHub</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.accounts?.github ? `@${admin.accounts.github}` : 'Not Connected'}</p>
                </div>
                {admin?.accounts?.github ? (
                  <span style={{ color: 'var(--jmx-emerald)', fontSize: '0.75rem', fontWeight: 700, zIndex: 3 }}>Active</span>
                ) : (
                  <button onClick={() => handleBindAccount('GitHub')} className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px', zIndex: 3 }}>Bind</button>
                )}
              </div>

              {/* LinkedIn */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(5, 5, 10, 0.6)' }}>
                {renderConnectionDot(!!admin?.accounts?.linkedin)}
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#0077b5', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 700, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', flexShrink: 0, color: '#fff', zIndex: 3 }}>IN</div>
                <div style={{ flexGrow: 1, minWidth: 0, zIndex: 3 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>LinkedIn</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.accounts?.linkedin ? `@${admin.accounts.linkedin}` : 'Not Connected'}</p>
                </div>
                {admin?.accounts?.linkedin ? (
                  <span style={{ color: 'var(--jmx-emerald)', fontSize: '0.75rem', fontWeight: 700, zIndex: 3 }}>Active</span>
                ) : (
                  <button onClick={() => handleBindAccount('LinkedIn')} className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px', zIndex: 3 }}>Bind</button>
                )}
              </div>

              {/* LeetCode */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(5, 5, 10, 0.6)' }}>
                {renderConnectionDot(!!admin?.accounts?.leetcode)}
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f89f1b', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 700, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', flexShrink: 0, color: '#fff', zIndex: 3 }}>LC</div>
                <div style={{ flexGrow: 1, minWidth: 0, zIndex: 3 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>LeetCode</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.accounts?.leetcode ? `@${admin.accounts.leetcode}` : 'Not Connected'}</p>
                </div>
                {admin?.accounts?.leetcode ? (
                  <span style={{ color: 'var(--jmx-emerald)', fontSize: '0.75rem', fontWeight: 700, zIndex: 3 }}>Active</span>
                ) : (
                  <button onClick={() => handleBindAccount('LeetCode')} className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px', zIndex: 3 }}>Bind</button>
                )}
              </div>

              {/* Codeforces */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(5, 5, 10, 0.6)' }}>
                {renderConnectionDot(!!admin?.accounts?.codeforces)}
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#445f9d', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 700, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', flexShrink: 0, color: '#fff', zIndex: 3 }}>CF</div>
                <div style={{ flexGrow: 1, minWidth: 0, zIndex: 3 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Codeforces</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.accounts?.codeforces ? `@${admin.accounts.codeforces}` : 'Not Connected'}</p>
                </div>
                {admin?.accounts?.codeforces ? (
                  <span style={{ color: 'var(--jmx-emerald)', fontSize: '0.75rem', fontWeight: 700, zIndex: 3 }}>Active</span>
                ) : (
                  <button onClick={() => handleBindAccount('Codeforces')} className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px', zIndex: 3 }}>Bind</button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Unified Command Cockpit Control Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 0 }}>
          
          {/* Operations Console Cockpit */}
          <div className="glass-panel admin-cockpit-grid" style={{ 
            padding: '1.75rem 2rem', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(2, 2, 5, 0.3)',
            borderRadius: '16px',
            flexGrow: 1,
            display: 'grid',
            gridTemplateColumns: '150px 1fr',
            gap: '1.75rem',
            minHeight: 0
          }}>
            {/* Left Console Keypad */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '0.75rem' }}>
              <h5 style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1rem', fontWeight: 700 }}>Console Keys</h5>
              
              <button 
                onClick={() => setActiveOperation('create-event')}
                style={{
                  background: activeOperation === 'create-event' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                  border: `1px solid ${activeOperation === 'create-event' ? 'var(--jmx-cyan)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: '6px',
                  color: activeOperation === 'create-event' ? 'var(--jmx-cyan)' : '#888',
                  padding: '0.65rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeOperation === 'create-event' ? '0 0 10px rgba(0, 240, 255, 0.1)' : 'none',
                  transition: 'all 0.25s'
                }}
              >
                [ EVENT LAUNCH ]
              </button>
              
              <button 
                onClick={() => setActiveOperation('hire')}
                style={{
                  background: activeOperation === 'hire' ? 'rgba(0, 255, 127, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                  border: `1px solid ${activeOperation === 'hire' ? 'var(--jmx-emerald)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: '6px',
                  color: activeOperation === 'hire' ? 'var(--jmx-emerald)' : '#888',
                  padding: '0.65rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeOperation === 'hire' ? '0 0 10px rgba(0, 255, 127, 0.1)' : 'none',
                  transition: 'all 0.25s'
                }}
              >
                [ RECRUIT CORE ]
              </button>

              <button 
                onClick={() => setActiveOperation('showcase')}
                style={{
                  background: activeOperation === 'showcase' ? 'rgba(255, 204, 0, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                  border: `1px solid ${activeOperation === 'showcase' ? 'var(--jmx-yellow)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: '6px',
                  color: activeOperation === 'showcase' ? 'var(--jmx-yellow)' : '#888',
                  padding: '0.65rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeOperation === 'showcase' ? '0 0 10px rgba(255, 204, 0, 0.1)' : 'none',
                  transition: 'all 0.25s'
                }}
              >
                [ SHOWCASE PROJ ]
              </button>

              <button 
                onClick={() => setActiveOperation('transfer')}
                style={{
                  background: activeOperation === 'transfer' ? 'rgba(255, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                  border: `1px solid ${activeOperation === 'transfer' ? 'var(--jmx-red)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: '6px',
                  color: activeOperation === 'transfer' ? 'var(--jmx-red)' : '#888',
                  padding: '0.65rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeOperation === 'transfer' ? '0 0 10px rgba(255, 68, 68, 0.1)' : 'none',
                  transition: 'all 0.25s'
                }}
              >
                [ SHIFT DUTIES ]
              </button>
            </div>

            {/* Right Execution Workspace Form */}
            <div style={{ overflowY: 'auto', maxHeight: '310px', paddingRight: '0.5rem', scrollbarWidth: 'thin' }}>
              
              {/* OPERATION: Event Launch */}
              {activeOperation === 'create-event' && (
                <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-cyan)', fontWeight: 600 }}>Title</label>
                      <input 
                        type="text" 
                        placeholder="Event Title"
                        style={getInputStyles('ev-title')}
                        onFocus={() => setFocusedInput('ev-title')}
                        onBlur={() => setFocusedInput(null)}
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-cyan)', fontWeight: 600 }}>Type</label>
                      <select 
                        style={getInputStyles('ev-type')}
                        onFocus={() => setFocusedInput('ev-type')}
                        onBlur={() => setFocusedInput(null)}
                        value={eventForm.type}
                        onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Coding Arena">Coding Arena</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-cyan)', fontWeight: 600 }}>Date</label>
                      <input 
                        type="date" 
                        style={getInputStyles('ev-date')}
                        onFocus={() => setFocusedInput('ev-date')}
                        onBlur={() => setFocusedInput(null)}
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-cyan)', fontWeight: 600 }}>Time</label>
                      <input 
                        type="time" 
                        style={getInputStyles('ev-time')}
                        onFocus={() => setFocusedInput('ev-time')}
                        onBlur={() => setFocusedInput(null)}
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--jmx-cyan)', fontWeight: 600 }}>Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Main Computer Center"
                      style={getInputStyles('ev-location')}
                      onFocus={() => setFocusedInput('ev-location')}
                      onBlur={() => setFocusedInput(null)}
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--jmx-cyan)', fontWeight: 600 }}>Event Cover Background Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        style={getInputStyles('ev-cover')}
                        onFocus={() => setFocusedInput('ev-cover')}
                        onBlur={() => setFocusedInput(null)}
                        onChange={handleEventCoverUpload}
                      />
                      {eventForm.coverImage && (
                        <div style={{ width: '48px', height: '36px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
                          <img src={eventForm.coverImage} alt="Event Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--jmx-cyan)', fontWeight: 600 }}>Brief Description</label>
                    <textarea 
                      rows={2}
                      placeholder="Provide details about the session..."
                      style={getInputStyles('ev-desc')}
                      onFocus={() => setFocusedInput('ev-desc')}
                      onBlur={() => setFocusedInput(null)}
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      padding: '0.6rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 800, 
                      borderRadius: '6px', 
                      marginTop: '0.25rem',
                      boxShadow: '0 4px 12px rgba(0, 240, 255, 0.25)' 
                    }}
                  >
                    Authorize & Launch Event
                  </button>
                </form>
              )}

              {/* OPERATION: Recruit Member (Domain drop-down selection and simplified fields) */}
              {activeOperation === 'hire' && (
                <form onSubmit={handleHireMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-emerald)', fontWeight: 600 }}>Username (Login Credential)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. rahul_v"
                        style={getInputStyles('hr-username', 'var(--jmx-emerald)')}
                        onFocus={() => setFocusedInput('hr-username')}
                        onBlur={() => setFocusedInput(null)}
                        value={hireForm.username}
                        onChange={(e) => setHireForm({ ...hireForm, username: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-emerald)', fontWeight: 600 }}>Assigned Role</label>
                      <select 
                        style={getInputStyles('hr-role', 'var(--jmx-emerald)')}
                        onFocus={() => setFocusedInput('hr-role')}
                        onBlur={() => setFocusedInput(null)}
                        value={hireForm.role}
                        onChange={(e) => setHireForm({ ...hireForm, role: e.target.value })}
                      >
                        <option value="Club Co-Manager">Club Co-Manager</option>
                        <option value="Domain Lead">Domain Lead</option>
                        <option value="Domain Specialist">Domain Specialist</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--jmx-emerald)', fontWeight: 600 }}>Domain</label>
                    <select 
                      style={getInputStyles('hr-domain', 'var(--jmx-emerald)')}
                      onFocus={() => setFocusedInput('hr-domain')}
                      onBlur={() => setFocusedInput(null)}
                      value={hireForm.domain}
                      onChange={(e) => setHireForm({ ...hireForm, domain: e.target.value })}
                    >
                      <option value="Web Dev">Web Dev</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="CP">CP</option>
                      <option value="Cyber sec">Cyber sec</option>
                      <option value="Game Dev">Game Dev</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--jmx-emerald)', fontWeight: 600 }}>Brief Role Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Brief description of role responsibilities..."
                      style={getInputStyles('hr-brief', 'var(--jmx-emerald)')}
                      onFocus={() => setFocusedInput('hr-brief')}
                      onBlur={() => setFocusedInput(null)}
                      value={hireForm.briefRole}
                      onChange={(e) => setHireForm({ ...hireForm, briefRole: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      padding: '0.6rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 800, 
                      borderRadius: '6px', 
                      background: 'var(--jmx-emerald)', 
                      borderColor: 'var(--jmx-emerald)', 
                      color: '#050505', 
                      marginTop: '0.25rem',
                      boxShadow: '0 4px 12px rgba(0, 255, 127, 0.25)'
                    }}
                  >
                    Confirm Recruitment
                  </button>
                </form>
              )}

              {/* OPERATION: Showcase Project (Gold/Yellow Accent) */}
              {activeOperation === 'showcase' && (
                <form onSubmit={handleCreateShowcase} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-yellow)', fontWeight: 600 }}>Project Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. NeuroTrack AI"
                        style={getInputStyles('sh-title', 'var(--jmx-yellow)')}
                        onFocus={() => setFocusedInput('sh-title')}
                        onBlur={() => setFocusedInput(null)}
                        value={showcaseForm.title}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, title: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-yellow)', fontWeight: 600 }}>Student Username</label>
                      <input 
                        type="text" 
                        placeholder="e.g. rohit_dev"
                        style={getInputStyles('sh-user', 'var(--jmx-yellow)')}
                        onFocus={() => setFocusedInput('sh-user')}
                        onBlur={() => setFocusedInput(null)}
                        value={showcaseForm.username}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, username: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-yellow)', fontWeight: 600 }}>Tech Stack</label>
                      <input 
                        type="text" 
                        placeholder="e.g. PyTorch, React"
                        style={getInputStyles('sh-tech', 'var(--jmx-yellow)')}
                        onFocus={() => setFocusedInput('sh-tech')}
                        onBlur={() => setFocusedInput(null)}
                        value={showcaseForm.techStack}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, techStack: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-yellow)', fontWeight: 600 }}>GitHub Link</label>
                      <input 
                        type="text" 
                        placeholder="https://github.com..."
                        style={getInputStyles('sh-github', 'var(--jmx-yellow)')}
                        onFocus={() => setFocusedInput('sh-github')}
                        onBlur={() => setFocusedInput(null)}
                        value={showcaseForm.github}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, github: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Local Photo Upload Picker (Base64 conversion) for Projects */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--jmx-yellow)', fontWeight: 600 }}>Project Cover Background Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        style={getInputStyles('sh-cover', 'var(--jmx-yellow)')}
                        onFocus={() => setFocusedInput('sh-cover')}
                        onBlur={() => setFocusedInput(null)}
                        onChange={handleShowcaseCoverUpload}
                      />
                      {showcaseForm.coverImage && (
                        <div style={{ width: '48px', height: '36px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
                          <img src={showcaseForm.coverImage} alt="Project Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--jmx-yellow)', fontWeight: 600 }}>Brief Project Summary</label>
                    <textarea 
                      rows={2}
                      placeholder="Brief details about project features..."
                      style={getInputStyles('sh-desc', 'var(--jmx-yellow)')}
                      onFocus={() => setFocusedInput('sh-desc')}
                      onBlur={() => setFocusedInput(null)}
                      value={showcaseForm.description}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, description: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      padding: '0.6rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 800, 
                      borderRadius: '6px', 
                      background: 'var(--jmx-yellow)', 
                      borderColor: 'var(--jmx-yellow)', 
                      color: '#050505',
                      marginTop: '0.25rem',
                      boxShadow: '0 4px 12px rgba(255, 204, 0, 0.25)'
                    }}
                  >
                    Confirm & Publish Project
                  </button>
                </form>
              )}

              {/* OPERATION: Shift Duty (Target Username, Bio, GitHub, LinkedIn - Red Themed) */}
              {activeOperation === 'transfer' && (
                <form onSubmit={handleTransferJob} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <p style={{ color: '#aaa', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                    Provide credentials of the target student to shift your duties. This will transfer your role of <strong>{admin?.role}</strong> directly to them.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-red)', fontWeight: 600 }}>Target Username (Credential)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. rohit_dev"
                        style={getInputStyles('tr-user', 'var(--jmx-red)')}
                        onFocus={() => setFocusedInput('tr-user')}
                        onBlur={() => setFocusedInput(null)}
                        value={transferForm.targetUsername}
                        onChange={(e) => setTransferForm({ ...transferForm, targetUsername: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-red)', fontWeight: 600 }}>GitHub Username</label>
                      <input 
                        type="text" 
                        placeholder="e.g. rohit_gh"
                        style={getInputStyles('tr-github', 'var(--jmx-red)')}
                        onFocus={() => setFocusedInput('tr-github')}
                        onBlur={() => setFocusedInput(null)}
                        value={transferForm.github || ''}
                        onChange={(e) => setTransferForm({ ...transferForm, github: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--jmx-red)', fontWeight: 600 }}>LinkedIn Username</label>
                      <input 
                        type="text" 
                        placeholder="e.g. rohit_linkedin"
                        style={getInputStyles('tr-linkedin', 'var(--jmx-red)')}
                        onFocus={() => setFocusedInput('tr-linkedin')}
                        onBlur={() => setFocusedInput(null)}
                        value={transferForm.linkedin || ''}
                        onChange={(e) => setTransferForm({ ...transferForm, linkedin: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--jmx-red)', fontWeight: 600 }}>Brief Bio</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Domain Lead for Web Dev curriculum"
                      style={getInputStyles('tr-bio', 'var(--jmx-red)')}
                      onFocus={() => setFocusedInput('tr-bio')}
                      onBlur={() => setFocusedInput(null)}
                      value={transferForm.bio || ''}
                      onChange={(e) => setTransferForm({ ...transferForm, bio: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      padding: '0.6rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 800, 
                      borderRadius: '6px', 
                      background: 'var(--jmx-red)', 
                      borderColor: 'var(--jmx-red)', 
                      color: '#050505',
                      marginTop: '0.25rem',
                      boxShadow: '0 4px 12px rgba(255, 68, 68, 0.25)'
                    }}
                  >
                    Transfer Job & Shift Duties
                  </button>
                </form>
              )}

            </div>

          </div>

        </div>

      </div>
    </main>
  )
}

export default AdminProfile
