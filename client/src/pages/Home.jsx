import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Typewriter from '../components/Typewriter'

gsap.registerPlugin(ScrollTrigger)

function Home() {
  const [aboutData, setAboutData] = useState({
    descriptionParagraph1: "Coding Club IIT Jammu is a group of passionate coders aimed at the overall development of coding culture in the college by introducing basic coding concepts to students who are new to the programming world and rendering a collaborative environment to the coders of the college along with providing technical assistance like websites, apps etc in college fests and other clubs.",
    descriptionParagraph2: "The club aims at introducing a diversity of inclinations in coding to the students so that they can pursue what interests them. They regularly hold sessions on various topics such as Machine learning, Competitive Coding, Web Development, App Development, Security and Open Source.",
    mission: "To cultivate a robust ecosystem of innovation, learning, and peer-to-peer mentorship.",
    vision: "Empowering every student to construct world-class software."
  })
  const [calendarEvents, setCalendarEvents] = useState([
    {
      id: 1,
      title: "Web Dev Bootcamp: APIs",
      type: "WORKSHOP",
      domain: "Web Dev",
      dateLabel: "LIVE NOW",
      description: "Look at the projector screen in the lecture hall to get the token.",
      jmxPoints: 50,
      status: "live",
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
      location: "MCC Lab",
      attended: false,
      attendees: []
    },
    {
      id: 2,
      title: "Winter Hack 2026",
      type: "HACKATHON",
      domain: "General",
      dateLabel: "NOV 15 - NOV 17",
      description: "The biggest 48-hour campus hackathon of the semester.",
      jmxPoints: 150,
      status: "upcoming",
      coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
      registeredCount: 124,
      registered: false,
      location: "Main Computer Center",
      attendees: []
    },
    {
      id: 3,
      title: "Intro to Web3 & Rust",
      type: "WORKSHOP",
      domain: "Web Dev",
      dateLabel: "NOV 22 • 5:00 PM",
      description: "Guest lecture and hands-on smart contract deployment.",
      jmxPoints: 50,
      status: "upcoming",
      coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80",
      registeredCount: 42,
      registered: false,
      location: "LH-101",
      attendees: []
    },
    {
      id: 4,
      title: "Intro to Git & GitHub",
      type: "WORKSHOP",
      domain: "Web Dev",
      dateLabel: "Oct 12, 2026",
      description: "Version control basics.",
      jmxPoints: 100,
      status: "past",
      coverImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80",
      attended: true,
      attendees: ["rohit_dev"]
    },
    {
      id: 5,
      title: "Linux Basics Workshop",
      type: "WORKSHOP",
      domain: "Cyber sec",
      dateLabel: "Sep 28, 2026",
      description: "Command line shell scripting fundamentals.",
      jmxPoints: 50,
      status: "past",
      coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80",
      attended: false,
      attendees: []
    }
  ])
  const [showcaseProjects, setShowcaseProjects] = useState([
    {
      id: 1,
      title: "NeuroTrack AI",
      username: "rohit_dev",
      techStack: "Machine Learning · React",
      description: "An AI-powered attendance tracking system.",
      jmxReward: 100,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      status: "Verified",
      category: "project"
    },
    {
      id: 2,
      title: "DefendChain",
      username: "rohit_dev",
      techStack: "Cybersecurity · Rust",
      description: "A decentralized blockchain auditing tool.",
      jmxReward: 150,
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      status: "Verified",
      category: "project"
    },
    {
      id: 3,
      title: "EtherSync",
      username: "priya_s",
      techStack: "Solidity · Ethers.js",
      description: "Real-time block stream visualizer and smart contract interface.",
      jmxReward: 120,
      coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
      status: "Verified",
      category: "project"
    },
    {
      id: 4,
      title: "VoxelEngine 3D",
      username: "aditya_g",
      techStack: "C++ · OpenGL",
      description: "A lightweight voxel rendering engine with customized physics.",
      jmxReward: 200,
      coverImage: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80",
      status: "Verified",
      category: "project"
    },
    {
      id: 5,
      title: "Sentix NLP",
      username: "nikhil_a",
      techStack: "Python · PyTorch",
      description: "Transformers-based sentiment analyzer with zero-shot classification.",
      jmxReward: 110,
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      status: "Verified",
      category: "project"
    }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    // Animate hero elements on load
    gsap.fromTo('.gsap-hero-elem', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
    )
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
          <div className="about-text-col">
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
          <div className="about-cards-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
      <section id="projects" className="container" style={{ paddingBottom: '6rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            <Typewriter text="Verified Showcase" speed={50} />
          </h2>
          {/* Scroll navigation arrows */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={handleScrollLeft} 
              className="btn-outline" 
              style={{ padding: '0.5rem 1.1rem', borderRadius: '50%', minWidth: '45px', minHeight: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}
              title="Scroll Left"
            >
              ←
            </button>
            <button 
              onClick={handleScrollRight} 
              className="btn-outline" 
              style={{ padding: '0.5rem 1.1rem', borderRadius: '50%', minWidth: '45px', minHeight: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}
              title="Scroll Right"
            >
              →
            </button>
          </div>
        </div>
        <div className="showcase-scroll-container" ref={scrollContainerRef}>
          {showcaseProjects.map((project) => (
            <div 
              key={project.id} 
              className="showcase-project-card fade-in-up"
              data-type="project"
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              style={{ padding: '1.5rem' }}
            >
              <div style={{ height: '200px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                 <img src={project.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{project.title}</h3>
                  <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '1rem' }}>{project.techStack}</p>
                </div>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '1.5rem' }}>{project.description}</p>
              <div style={{ marginTop: 'auto' }}>
                <a 
                  href={project.github || "https://github.com"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-outline" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-block', width: '100%', textAlign: 'center' }}
                >
                  View Code Repository
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home