import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Typewriter from '../components/Typewriter'

gsap.registerPlugin(ScrollTrigger)

function Home() {
  const [aboutData, setAboutData] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [showcaseProjects, setShowcaseProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    // Animate hero elements on load
    gsap.fromTo('.gsap-hero-elem', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
    )

    // Fetch homepage data from backend API
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const [aboutRes, calendarRes, projectsRes] = await Promise.all([
          fetch('/api/about'),
          fetch('/api/events'),
          fetch('/api/projects?verified=true')
        ])

        if (!aboutRes.ok || !calendarRes.ok || !projectsRes.ok) {
          throw new Error('Failed to fetch homepage data from server.')
        }

        const aboutJson = await aboutRes.json()
        const calendarJson = await calendarRes.json()
        const projectsJson = await projectsRes.json()

        setAboutData(aboutJson)
        setCalendarEvents(calendarJson)
        setShowcaseProjects(projectsJson)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  // Initialize ScrollTrigger on elements after data loads and is rendered
  useEffect(() => {
    if (loading || error) return

    // Trigger animations for sections as they scroll into view
    const fadeElements = document.querySelectorAll('.fade-in-up')
    fadeElements.forEach(elem => {
      gsap.fromTo(elem,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        }
      )
    })

    // Sequenced animation timeline for About Us panel elements
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".gsap-about-panel",
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    })

    tl.fromTo(".gsap-about-panel", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    )
    .fromTo(".gsap-about-child", 
      { opacity: 0, y: 25 }, 
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.25, ease: "power2.out" },
      "-=0.4"
    )

    // Cleanup scroll triggers when page changes
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [loading, error, calendarEvents, showcaseProjects])

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

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -460, behavior: 'smooth' })
    }
  }

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 460, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.25rem', color: 'var(--jmx-cyan)' }}>
        Loading Developer Hub...
      </div>
    )
  }

  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST'
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setCalendarEvents(prev => prev.map(e => {
          if (e.id === eventId) {
            return { ...e, registered: true, registeredCount: result.registeredCount }
          }
          return e
        }))
        alert("Successfully registered for this event!")
      } else {
        alert(result.error || "Failed to register.")
      }
    } catch (err) {
      alert("Error contacting the registration server.")
    }
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--jmx-red)', fontSize: '1.25rem' }}>
        Error: {error}
      </div>
    )
  }

  // Filter events to only display 'live' and 'upcoming' ones, putting 'live' first
  const filteredEvents = calendarEvents.filter(event => event.status === 'live' || event.status === 'upcoming')
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1
    if (a.status !== 'live' && b.status === 'live') return 1
    return 0
  })
  
  // Display at most 6 active events (2 rows of 3 columns)
  const displayedEvents = sortedEvents.slice(0, 6)

  return (
    <main>
      {/* Hero Section */}
      <section id="hero" className="hero container">
        <div className="gsap-hero-elem">
          <h1>
            <Typewriter text="Elevate Your" speed={60} />
            <br/>
            <span className="text-gradient">
              <Typewriter text="Developer Identity" speed={60} delay={800} />
            </span>
          </h1>
          <p>{aboutData?.heroSubtitle || "The official hub for IIT Jammu's developer ecosystem. Build, collaborate, and participate in campus hackathons."}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/profile" className="btn-primary">Join the Ecosystem</Link>
            <a href="#projects" className="btn-outline">Explore Projects</a>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="container" style={{ minHeight: 'auto', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="glass-panel gsap-about-panel" style={{ padding: '3rem', display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap', opacity: 0 }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 className="section-title gsap-about-child" style={{ textAlign: 'left', marginBottom: '1.5rem', opacity: 0 }}>
              About <span className="text-gradient">Us</span>
            </h2>
            <p className="gsap-about-child" style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem', opacity: 0 }}>
              {aboutData?.descriptionParagraph1 || ""}
            </p>
            <p className="gsap-about-child" style={{ color: '#a0a0a0', lineHeight: '1.7', opacity: 0 }}>
              {aboutData?.descriptionParagraph2 || ""}
            </p>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card gsap-about-child" style={{ borderLeft: '4px solid var(--jmx-cyan)', opacity: 0 }}>
              <h4 style={{ color: 'var(--jmx-cyan)', fontWeight: 700, marginBottom: '0.25rem' }}>Our Mission</h4>
              <p style={{ color: '#ccc', fontSize: '0.95rem' }}>{aboutData?.mission || ""}</p>
            </div>
            <div className="glass-card gsap-about-child" style={{ borderLeft: '4px solid var(--jmx-purple)', opacity: 0 }}>
              <h4 style={{ color: 'var(--jmx-purple)', fontWeight: 700, marginBottom: '0.25rem' }}>Our Vision</h4>
              <p style={{ color: '#ccc', fontSize: '0.95rem' }}>{aboutData?.vision || ""}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Calendar Section */}
      <section id="calendar" className="container" style={{ minHeight: 'auto', paddingTop: '3rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            <Typewriter text="Event Calendar" speed={50} />
          </h2>
        </div>
        <div className="grid grid-3">
          {displayedEvents.map((event) => {
            const isLive = event.status === 'live'
            const colorClass = isLive ? '#ff4444' : event.type === 'HACKATHON' ? 'var(--jmx-cyan)' : event.type === 'WORKSHOP' ? 'var(--jmx-purple)' : 'var(--jmx-emerald)';
            const borderStyle = { borderLeft: `4px solid ${colorClass}`, position: 'relative', overflow: 'hidden' };
            const badgeBg = isLive ? 'rgba(255, 68, 68, 0.1)' : event.type === 'HACKATHON' ? 'rgba(0, 240, 255, 0.1)' : event.type === 'WORKSHOP' ? 'rgba(138, 43, 226, 0.1)' : 'rgba(0, 255, 127, 0.1)';

            return (
              <div 
                key={event.id} 
                className="glass-card fade-in-up interactive-hover-card" 
                style={borderStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, background: badgeBg, color: colorClass, padding: '0.2rem 0.8rem', borderBottomLeftRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {event.type}
                </div>
                <p style={{ color: colorClass, fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {isLive ? 'LIVE NOW' : event.dateLabel}
                </p>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{event.title}</h3>
                <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{event.description}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>{event.registeredCount || 0} Registered</span>
                  {!isLive && (
                    event.registered ? (
                      <span style={{ color: 'var(--jmx-emerald)', fontWeight: 600, fontSize: '0.95rem' }}>✓ Registered</span>
                    ) : (
                      <button onClick={() => handleRegister(event.id)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Register Now</button>
                    )
                  )}
                  {isLive && (
                    <span style={{ color: '#ff4444', fontWeight: 600, fontSize: '0.95rem' }}>Active Session</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Centered View All Events button below cards */}
        <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'center', marginTop: '3.5rem' }}>
          <Link to="/events" className="btn-outline" style={{ padding: '0.75rem 2.5rem', fontSize: '1rem', fontWeight: 600 }}>
            View All Events
          </Link>
        </div>
      </section>

      {/* Top Projects Showcase */}
     < section id="projects" className="container" style={{paddingBottom: '4rem', position: 'relative'}}>
     <div style= {{ textAlign: 'centre', padding: '4rem 0'}}> 
         <h2 className="section-title" style={{marginBottom: '1rem'}}>  
            <Typewriter text="Verified Showcase" speed={50} />
         </h2>
         <p style = {{ fontSize: '1.2rem', color: '#ccc'}}>Coming Soon...</p>
     </div>
      </section> 
    </main>
  )
}

export default Home