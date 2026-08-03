import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Interactive Mesh Grid Background Component ──────────────────────────────
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

    const gridSpacing = 45
    const influenceRadius = 160
    const bendStrength = -30 

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
      bgGrad.addColorStop(0, '#030308')
      bgGrad.addColorStop(1, '#070712')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      const mouse = mouseRef.current
      const cols = Math.ceil(width / gridSpacing) + 2
      const rows = Math.ceil(height / gridSpacing) + 2

      const points = []
      for (let r = 0; r < rows; r++) {
        points[r] = []
        for (let c = 0; c < cols; c++) {
          const origX = (c - 1) * gridSpacing
          const origY = (r - 1) * gridSpacing

          let currentX = origX
          let currentY = origY

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

      ctx.lineWidth = 0.8
      
      for (let r = 0; r < rows; r++) {
        ctx.beginPath()
        for (let c = 0; c < cols; c++) {
          if (c === 0) ctx.moveTo(points[r][c].x, points[r][c].y)
          else ctx.lineTo(points[r][c].x, points[r][c].y)
        }
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)'
        ctx.stroke()
      }

      for (let c = 0; c < cols; c++) {
        ctx.beginPath()
        for (let r = 0; r < rows; r++) {
          if (r === 0) ctx.moveTo(points[r][c].x, points[r][c].y)
          else ctx.lineTo(points[r][c].x, points[r][c].y)
        }
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)'
        ctx.stroke()
      }

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

function Team() {
  const [teamMembers, setTeamMembers] = useState([
    { id: 2, name: "Aarav Sharma", role: "Technical Secretary", category: "coordinator", bio: "Overseeing all branch events.", avatar: "https://i.pravatar.cc/300?img=11", github: "#", linkedin: "#" },
    { id: 3, name: "Priya Singh", role: "Club Co-Manager", category: "coordinator", bio: "Managing operational logistics.", avatar: "https://i.pravatar.cc/300?img=5", github: "#", linkedin: "#" },
    { id: 4, name: "Rohan Gupta", role: "Competitive Programming Lead", category: "lead", bio: "Candidate Master on Codeforces.", avatar: "https://i.pravatar.cc/300?img=12", github: "#", linkedin: "#" },
    { id: 5, name: "Sneha Reddy", role: "Artificial Intelligence Lead", category: "lead", bio: "Machine Learning practitioner.", avatar: "https://i.pravatar.cc/300?img=47", github: "#", linkedin: "#" },
    { id: 6, name: "Kabir Malhotra", role: "Cybersecurity Lead", category: "lead", bio: "CTF player and penetration tester.", avatar: "https://i.pravatar.cc/300?img=18", github: "#", linkedin: "#" },
    { id: 7, name: "Isha Patel", role: "Domain Specialist (Web Dev)", category: "specialist", bio: "Fullstack React & Node engineer.", avatar: "https://i.pravatar.cc/300?img=32", github: "#", linkedin: "#" },
    { id: 8, name: "Nikhil Verma", role: "Domain Specialist (AI/ML)", category: "specialist", bio: "Computer Vision and NLP enthusiast.", avatar: "https://i.pravatar.cc/300?img=15", github: "#", linkedin: "#" },
    { id: 9, name: "Karan Johar", role: "Domain Specialist (CP)", category: "specialist", bio: "Expert at trees and dynamic programming algorithms.", avatar: "https://i.pravatar.cc/300?img=8", github: "#", linkedin: "#" },
    { id: 10, name: "Simran Kaur", role: "Domain Specialist (Cyber sec)", category: "specialist", bio: "Penetration tester and network defense enthusiast.", avatar: "https://i.pravatar.cc/300?img=23", github: "#", linkedin: "#" },
    { id: 11, name: "Aditya Roy", role: "Domain Specialist (Game Dev)", category: "specialist", bio: "3D physics engine and Unity gameplay logic designer.", avatar: "https://i.pravatar.cc/300?img=60", github: "#", linkedin: "#" }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDomain, setSelectedDomain] = useState('All')

  const filterDomains = ['All', 'Web Dev', 'AI/ML', 'CP', 'Cyber sec', 'Game Dev']

  useEffect(() => {
    if (loading || error || teamMembers.length === 0) return

    const sections = document.querySelectorAll('.gsap-team-section')
    sections.forEach(section => {
      const bg = section.querySelector('.gsap-team-bg')
      const text = section.querySelector('.gsap-team-text')

      if (bg) {
        gsap.fromTo(bg,
          { scale: 1.15 },
          {
            scrollTrigger: {
              trigger: section,
              scroller: ".team-scroll-container",
              start: "top center",
              toggleActions: "play none none reverse"
            },
            scale: 1,
            duration: 1.6,
            ease: "power2.out"
          }
        )
      }

      if (text) {
        gsap.fromTo(text,
          { opacity: 0, x: 60 },
          {
            scrollTrigger: {
              trigger: section,
              scroller: ".team-scroll-container",
              start: "top center",
              toggleActions: "play none none reverse"
            },
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: "power3.out"
          }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [loading, error, teamMembers])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.25rem', color: 'var(--jmx-cyan)' }}>
        Retrieving Team Nodes...
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

  const cinematicMembers = teamMembers.filter(m => m.category === 'coordinator' || m.category === 'lead')
  const specialistMembers = teamMembers.filter(m => m.category !== 'coordinator' && m.category !== 'lead' && m.category !== 'faculty')

  const filteredSpecialists = selectedDomain === 'All'
    ? specialistMembers
    : specialistMembers.filter(m => m.role.includes(`(${selectedDomain})`))

  return (
    <div style={{
      height: '100vh',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      position: 'relative',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }} className="team-scroll-container">
      
      {/* Blue grid mesh background */}
      <InteractiveGridMesh />
      
      {/* 1. Cinematic Full-Screen Sliders */}
      {cinematicMembers.map((member, idx) => {
        const isManager = member.role.includes('Co-Manager') || member.role.includes('Secretary')
        const themeColor = isManager ? 'var(--jmx-cyan)' : 'var(--jmx-purple)'

        return (
          <section 
            key={member.id}
            className="gsap-team-section"
            style={{
              height: '100vh',
              width: '100vw',
              scrollSnapAlign: 'start',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: '0 8% 8% 8%',
              overflow: 'hidden'
            }}
          >
            <div 
              className="gsap-team-bg"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1,
                opacity: 1
              }} 
            />

            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '100%',
              height: '75vh',
              backdropFilter: 'blur(35px) brightness(0.65)',
              WebkitBackdropFilter: 'blur(35px) brightness(0.65)',
              maskImage: 'radial-gradient(circle at bottom right, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 80%)',
              WebkitMaskImage: 'radial-gradient(circle at bottom right, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 80%)',
              zIndex: 2,
              pointerEvents: 'none'
            }} />

            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '120px',
              background: 'linear-gradient(to top, #020205 10%, transparent)',
              zIndex: 2
            }} />

            <div 
              className="gsap-team-text"
              style={{
                position: 'relative',
                zIndex: 3,
                maxWidth: '540px',
                width: '100%',
                padding: '2rem 0',
                opacity: 0
              }}
            >
              <span style={{
                color: themeColor,
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15rem',
                display: 'inline-block',
                marginBottom: '0.75rem'
              }}>
                {member.role}
              </span>
              
              <h2 className="text-gradient" style={{
                fontSize: '3.25rem',
                fontWeight: 800,
                margin: '0 0 1.25rem 0',
                fontFamily: 'var(--font-title)',
                lineHeight: 1.15
              }}>
                {member.name}
              </h2>

              <p style={{
                color: '#ffffff',
                fontSize: '1.05rem',
                lineHeight: 1.75,
                marginBottom: '2rem',
                fontWeight: 400,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                {member.bio}
              </p>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {member.github && (
                  <a href={member.github} target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', borderRadius: '20px', borderColor: 'rgba(255, 255, 255, 0.4)', background: 'rgba(0, 0, 0, 0.2)' }}>GitHub</a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', borderRadius: '20px' }}>LinkedIn</a>
                )}
              </div>
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '2.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 500,
              zIndex: 3,
              animation: 'bounceIndicator 2s infinite',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>
              <span>Scroll Down</span>
              <span style={{ fontSize: '1.1rem' }}>↓</span>
            </div>
          </section>
        )
      })}

      {/* 2. Traditional Grid Section */}
      {specialistMembers.length > 0 && (
        <section 
          className="gsap-team-section-static"
          style={{
            minHeight: '100vh',
            width: '100vw',
            scrollSnapAlign: 'start',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '7rem 8% 6rem 8%',
            boxSizing: 'border-box'
          }}
        >
          <div 
            style={{ 
              maxWidth: '1200px', 
              width: '100%', 
              zIndex: 3
            }}
          >
            <div>
              <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem', marginTop: 0 }}>
                Domain <span className="text-gradient">Specialists</span>
              </h1>
              <p style={{ color: '#a0a0a0', marginBottom: '2.5rem', fontSize: '1rem', textAlign: 'left' }}>
                Technical domain advisors and field specialists.
              </p>

              {/* 6 Filter Buttons — styled as JSX self-closing tags with animations */}
              <div className="top-nav-buttons" style={{ display: 'flex', gap: '.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {filterDomains.map((dom) => {
                  const isActive = selectedDomain === dom
                  const activeColor = '#00e5ff'
                  return (
                    <button 
                      key={dom}
                      className={`top-tab-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedDomain(dom)}
                      style={{
                        fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                        fontSize: '.88rem',
                        letterSpacing: '-.01em',
                        padding: '.5rem 1.15rem',
                        background: isActive ? `${activeColor}12` : 'rgba(255, 255, 255, .025)',
                        border: `1px solid ${isActive ? activeColor + '45' : 'rgba(255,255,255,.07)'}`,
                        borderRadius: 10,
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                        boxShadow: isActive ? `0 0 16px ${activeColor}28` : 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 0,
                      }}
                    >
                      <span style={{ color: isActive ? activeColor : '#333', fontWeight: 700, transition: 'color .2s' }}>&lt;</span>
                      <span style={{ color: isActive ? '#fff' : '#555', margin: '0 .12rem', transition: 'color .2s' }}>{dom}</span>
                      <span style={{ color: isActive ? activeColor : '#333', fontWeight: 700, transition: 'color .2s' }}>/&gt;</span>
                    </button>
                  )
                })}
              </div>

              {/* Specialists Cards Grid */}
              <div className="grid grid-3" style={{ 
                gap: '2rem', 
                justifyContent: 'center',
                width: '100%',
                marginTop: '1.5rem'
              }}>
                {filteredSpecialists.map(member => {
                  const isSpecialist = member.role.includes('Specialist')
                  const match = member.role.match(/\(([^)]+)\)/)
                  const domainName = match ? match[1] : member.role

                  return (
                    <div 
                      key={member.id} 
                      className="interactive-hover-card" 
                      style={{ 
                        padding: '2.5rem 1.5rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        background: 'rgba(10, 10, 20, 0.12)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)', 
                        borderRadius: '16px',
                        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
                        e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.35)'
                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 229, 255, 0.08)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div className="team-avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '1.5rem', border: '2px solid rgba(0, 229, 255, 0.15)', padding: '4px' }}>
                        <img src={member.avatar || "https://i.pravatar.cc/300?img=12"} alt={member.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="team-role" style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--jmx-cyan)', marginBottom: '0.5rem' }}>
                        {domainName}
                      </div>
                      <div className="team-name" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>
                        {member.name}
                      </div>
                      <p className="team-bio" style={{ color: '#a0a0a0', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem', flexGrow: 1 }}>
                        {member.bio}
                      </p>
                      <div className="team-socials" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {member.github && (
                          <a href={member.github} target="_blank" rel="noreferrer" style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', textDecoration: 'none', transition: 'background 0.3s' }}>GH</a>
                        )}
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noreferrer" style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', textDecoration: 'none', transition: 'background 0.3s' }}>LN</a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Team

