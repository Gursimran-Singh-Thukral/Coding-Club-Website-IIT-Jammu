import React, { useState, useEffect, useRef } from 'react'
import Typewriter from '../components/Typewriter'

const DOMAIN_COLORS = {
  'Web Dev':   { neon: '#00e5ff', dim: 'rgba(0,229,255,0.12)' },
  'AI/ML':     { neon: '#a855f7', dim: 'rgba(168,85,247,0.12)' },
  'CP':        { neon: '#f59e0b', dim: 'rgba(245,158,11,0.12)' },
  'Cyber sec': { neon: '#ff4444', dim: 'rgba(255,68,68,0.12)' },
  'Game Dev':  { neon: '#00ff7f', dim: 'rgba(0,255,127,0.12)' },
  'General':   { neon: '#00e5ff', dim: 'rgba(0,229,255,0.12)' },
}
const DOMAINS   = ['Web Dev', 'AI/ML', 'CP', 'Cyber sec', 'Game Dev', 'General']
const EVT_TYPES = ['WORKSHOP', 'HACKATHON', 'SEMINAR', 'COMPETITION', 'MEETUP']

const statusColors = {
  live:     { bg: 'rgba(255,68,68,0.18)',   border: '#ff4444', text: '#ff6b6b' },
  upcoming: { bg: 'rgba(0,229,255,0.10)',   border: '#00e5ff', text: '#00e5ff' },
  past:     { bg: 'rgba(160,160,160,0.08)', border: '#666',    text: '#888' },
}

function canEdit(adminRole, adminDomain, eventDomain) {
  if (['Technical Secretary', 'Club Co-Manager'].includes(adminRole)) return true
  if (['Domain Lead', 'Domain Specialist'].includes(adminRole)) return adminDomain === eventDomain
  return false
}

const LiveDot = () => (
  <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:'#ff4444',
    boxShadow:'0 0 8px #ff4444', animation:'pulse-dot 1.4s infinite', marginRight:6 }} />
)

function CountdownBadge({ seconds }) {
  const r = 10, circ = 2 * Math.PI * r
  return (
    <svg width={28} height={28} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={14} cy={14} r={r} fill="none" stroke="rgba(255,68,68,.2)" strokeWidth={3}/>
      <circle cx={14} cy={14} r={r} fill="none" stroke="#ff4444" strokeWidth={3}
        strokeDasharray={`${(seconds/30)*circ} ${circ}`}
        style={{ transition:'stroke-dasharray 1s linear' }}/>
    </svg>
  )
}

// ── Inline editable card (used for both edit & create) ────────────────────
function EditableCard({ event, isNew, onSave, onCancel, accentColor = '#00e5ff' }) {
  const blank = {
    title:'', description:'', dateLabel:'', location:'',
    jmxPoints:50, type:'WORKSHOP', domain:'Web Dev', coverImage:''
  }
  const [form, setForm] = useState(isNew ? blank : {
    title:       event.title,
    description: event.description,
    dateLabel:   event.dateLabel || '',
    location:    event.location || '',
    jmxPoints:   event.jmxPoints || 50,
    type:        event.type || 'WORKSHOP',
    domain:      event.domain || 'Web Dev',
    coverImage:  event.coverImage || '',
  })
  const [coverPreview, setCoverPreview] = useState(isNew ? null : (event.coverImage || null))
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setCoverPreview(reader.result); set('coverImage', reader.result) }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const col = DOMAIN_COLORS[form.domain] || DOMAIN_COLORS['General']

  return (
    <div style={{
      background: 'rgba(8,8,20,.95)',
      border: `1px solid ${col.neon}60`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: `0 0 30px ${col.neon}18`,
      animation: 'card-expand .25s cubic-bezier(.4,0,.2,1)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Cover area — clickable to change image */}
      <label style={{ display:'block', position:'relative', height:160, cursor:'pointer', overflow:'hidden', flexShrink:0 }}>
        <img
          src={coverPreview || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
          alt="cover"
          style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(.55)' }}
        />
        <div style={{
          position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:6,
          background: coverPreview ? 'rgba(0,0,0,.35)' : `${col.neon}18`,
        }}>
          <span style={{ fontSize:'1.8rem' }}>🖼️</span>
          <span style={{ color: col.neon, fontSize:'.78rem', fontWeight:700, letterSpacing:'.06em' }}>
            {coverPreview ? 'CLICK TO CHANGE COVER' : 'CLICK TO ADD COVER'}
          </span>
        </div>
        <input type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }}/>
      </label>

      {/* Fields */}
      <div style={{ padding:'1.1rem 1.2rem', display:'flex', flexDirection:'column', gap:'.75rem', flex:1 }}>

        {/* Title */}
        <input
          className="ae-input ae-title-input"
          placeholder="Event title…"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          style={{ fontSize:'1rem', fontWeight:700, borderColor: `${col.neon}50` }}
        />

        {/* Domain + Type row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.6rem' }}>
          <div>
            <label className="ae-label">Domain</label>
            <select className="ae-input" value={form.domain} onChange={e => set('domain', e.target.value)}>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="ae-label">Type</label>
            <select className="ae-input" value={form.type} onChange={e => set('type', e.target.value)}>
              {EVT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Date + Location row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.6rem' }}>
          <div>
            <label className="ae-label">Date / Time</label>
            <input className="ae-input" placeholder="e.g. NOV 15 · 5PM" value={form.dateLabel} onChange={e => set('dateLabel', e.target.value)}/>
          </div>
          <div>
            <label className="ae-label">Location</label>
            <input className="ae-input" placeholder="e.g. LH-101" value={form.location} onChange={e => set('location', e.target.value)}/>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="ae-label">Description</label>
          <textarea className="ae-input" rows={3} placeholder="What is this event about?" style={{ resize:'vertical' }}
            value={form.description} onChange={e => set('description', e.target.value)}/>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:'.6rem', marginTop:'.25rem' }}>
          <button className="ae-btn" onClick={onCancel}
            style={{ flex:1, background:'rgba(255,255,255,.05)', color:'#888', border:'1px solid rgba(255,255,255,.1)' }}>
            Cancel
          </button>
          <button className="ae-btn" onClick={handleSubmit} disabled={saving}
            style={{ flex:2, background:`linear-gradient(135deg,${col.neon},${col.neon}99)`,
              color:'#000', fontWeight:800, boxShadow:`0 0 14px ${col.neon}40` }}>
            {saving ? 'Saving…' : isNew ? '＋ Create Event' : '✓ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add-Event trigger card ────────────────────────────────────────────────
function AddEventCard({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(0,229,255,.04)',
      border: '2px dashed rgba(0,229,255,.25)',
      borderRadius: 16, cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '.7rem', minHeight: 280,
      color: '#00e5ff', transition: 'all .2s',
      fontFamily: 'Inter, sans-serif',
    }}
    onMouseEnter={e => { e.currentTarget.style.background='rgba(0,229,255,.08)'; e.currentTarget.style.borderColor='rgba(0,229,255,.5)'; e.currentTarget.style.boxShadow='0 0 20px rgba(0,229,255,.12)' }}
    onMouseLeave={e => { e.currentTarget.style.background='rgba(0,229,255,.04)'; e.currentTarget.style.borderColor='rgba(0,229,255,.25)'; e.currentTarget.style.boxShadow='none' }}
    >
      <span style={{ fontSize:'2.5rem', lineHeight:1, opacity:.7 }}>＋</span>
      <span style={{ fontSize:'.9rem', fontWeight:700, letterSpacing:'.06em', opacity:.8 }}>NEW EVENT</span>
      <span style={{ fontSize:'.75rem', color:'#555' }}>Click to create</span>
    </button>
  )
}

// ── Read-only event card ──────────────────────────────────────────────────
function EventCard({ event, editable, onEdit, onGoLive, onAttendance, onRegister, onCheckAttendance, liveSecsLeft }) {
  const [registered, setRegistered] = useState(!!event.registered)
  const [regCount, setRegCount]     = useState(event.registeredCount || 0)

  const handleRegClick = async () => {
    if (registered) return
    const result = await onRegister(event.id)
    if (result?.success) {
      setRegistered(true)
      setRegCount(result.registeredCount || regCount + 1)
    }
  }
  const domColor = DOMAIN_COLORS[event.domain] || DOMAIN_COLORS['General']
  const sColor   = statusColors[event.status]

  return (
    <div 
      className="event-card interactive-hover-card"
      style={{
      background: 'rgba(10,10,20,.75)',
      border: `1px solid ${domColor.neon}28`,
      borderRadius: 16, overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      boxShadow: event.status === 'live' ? '0 0 22px rgba(255,68,68,.15)' : 'none',
      animation: 'slide-up .35s ease',
      display: 'flex', flexDirection: 'column',
      transition: 'transform .2s, box-shadow .2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform='translateY(-4px)';
      window.dispatchEvent(new CustomEvent('card-hover', {
        detail: { active: true, element: e.currentTarget }
      }));
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform='none';
      window.dispatchEvent(new CustomEvent('card-hover', {
        detail: { active: false }
      }));
    }}
    >
      {/* Cover */}
      <div style={{ position:'relative', height:160, overflow:'hidden', flexShrink:0 }}>
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
          alt={event.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', filter: event.status==='past' ? 'grayscale(.6)' : 'none' }}
        />
        {/* Status + domain badges */}
        <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:7 }}>
          <span style={{ background:sColor.bg, border:`1px solid ${sColor.border}`, color:sColor.text,
            padding:'.18rem .6rem', borderRadius:20, fontSize:'.7rem', fontWeight:700,
            display:'flex', alignItems:'center', gap:4 }}>
            {event.status === 'live' && <LiveDot/>}
            {event.status.toUpperCase()}
          </span>
          <span style={{ background:domColor.dim, border:`1px solid ${domColor.neon}50`, color:domColor.neon,
            padding:'.18rem .6rem', borderRadius:20, fontSize:'.7rem', fontWeight:600 }}>
            {event.domain}
          </span>
        </div>
        {/* Live countdown badge */}
        {event.status === 'live' && (
          <div style={{ position:'absolute', top:10, right:10, display:'flex', alignItems:'center', gap:4 }}>
            <CountdownBadge seconds={liveSecsLeft}/>
            <span style={{ color:'#ff6b6b', fontSize:'.73rem', fontWeight:700 }}>{liveSecsLeft}s</span>
          </div>
        )}
        {/* Edit button */}
        {editable && (
          <button className="ae-btn" onClick={onEdit} style={{
            position:'absolute', bottom:10, right:10,
            background:'rgba(0,0,0,.78)', color:'#fff', fontSize:'.75rem', padding:'.3rem .7rem',
          }}>✏️ Edit</button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding:'1rem 1.2rem', flex:1, display:'flex', flexDirection:'column' }}>
        <h3 style={{ margin:'0 0 .25rem', fontSize:'1rem', fontWeight:700, color:'#fff' }}>{event.title}</h3>
        <p style={{ margin:'0 0 .7rem', color:'#777', fontSize:'.8rem' }}>
          {event.dateLabel}{event.location ? ` • ${event.location}` : ''}
        </p>
        <p style={{ margin:'0 0 auto', color:'#bbb', fontSize:'.83rem', lineHeight:1.5,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {event.description}
        </p>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'1rem' }}>
          <span style={{ color:'#f59e0b', fontSize:'.8rem', fontWeight:600 }}>+{event.jmxPoints} JmX</span>
          <div style={{ display:'flex', gap:'.45rem', alignItems:'center' }}>
            {event.status === 'upcoming' && (
              <>
                {registered ? (
                  <span style={{ display:'flex', alignItems:'center', gap:'.35rem', color:'#00ff7f', fontSize:'.82rem', fontWeight:700 }}>
                    <span style={{ fontSize:'.9rem' }}>✓</span> Registered
                  </span>
                ) : (
                  <button className="ae-btn" onClick={handleRegClick} style={{
                    background:'linear-gradient(135deg,#00ff7f22,#00ff7f11)',
                    border:'1px solid rgba(0,255,127,.4)', color:'#00ff7f',
                  }}>Register</button>
                )}
                <button className="ae-btn" onClick={onGoLive} style={{
                  background:'linear-gradient(135deg,#ff4444,#ff8c00)', color:'#fff',
                  boxShadow:'0 0 12px rgba(255,68,68,.35)',
                }}>🚀 Go Live</button>
              </>
            )}
            {event.status === 'live' && (
              <button className="ae-btn" onClick={onAttendance} style={{
                background:'linear-gradient(135deg,#ff4444,#c00)', color:'#fff',
                boxShadow:'0 0 14px rgba(255,0,0,.45)',
              }}>Take Attendance</button>
            )}
            {event.status === 'past' && (
              <button className="ae-btn" onClick={onCheckAttendance} style={{
                background: 'rgba(168,85,247,.12)',
                border: '1px solid rgba(168,85,247,.35)',
                color: '#a855f7',
              }}>
                📋 Check Attendance
                <span style={{ marginLeft:'.4rem', background:'rgba(168,85,247,.2)', borderRadius:20, padding:'.05rem .45rem', fontSize:'.72rem' }}>
                  {(event.attendees||[]).length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function AdminEvents() {
  const [adminProfile, setAdminProfile] = useState(null)
  const [events, setEvents]             = useState([])
  const [activeTab, setActiveTab]       = useState('live')
  const [editingId, setEditingId]       = useState(null)   // event id being edited (null = none)
  const [showNewCard, setShowNewCard]   = useState(false)  // show new-event editable card
  const [liveTimers, setLiveTimers]     = useState({})
  const [toast, setToast]               = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/profile').then(r => r.json()),
      fetch('/api/events').then(r => r.json()),
    ]).then(([prof, evts]) => {
      setAdminProfile(prof); setEvents(evts)
    }).catch(() => showToast('Failed to load.', false))
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const secs = Math.ceil((30000 - (Date.now() % 30000)) / 1000)
      setLiveTimers(prev => {
        const next = {}
        events.filter(e => e.status === 'live').forEach(e => { next[e.id] = secs })
        return next
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [events])

  const showToast = (text, success = true) => {
    setToast({ text, success })
    setTimeout(() => setToast(null), 3000)
  }

  const handleTabClick = (newTab) => {
    if (newTab === activeTab) return;
    const cardElements = document.querySelectorAll('.event-card');
    const rects = Array.from(cardElements).map(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    });
    window.dispatchEvent(new CustomEvent('cards-shatter', { detail: { rects } }));
    
    // Switch active tab after small delay to let transition play
    setTimeout(() => {
      setActiveTab(newTab);
      setEditingId(null);
      setShowNewCard(false);
    }, 150);
  }

  const handleGoLive = async (eventId) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/golive`, { method:'POST' })
      const data = await res.json()
      if (!res.ok) return showToast(data.error || 'Failed.', false)
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status:'live', dateLabel:'LIVE NOW' } : e))
      handleTabClick('live')
      showToast('Event is now LIVE!', true)
    } catch { showToast('Network error.', false) }
  }

  const handleAttendance = (eventId) => {
    window.open(`/admin/attendance/${eventId}`, '_blank', 'noopener,noreferrer')
  }

  // Save edits to an existing event
  const handleSaveEdit = async (eventId, form) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Save failed.', false); return }
      setEvents(prev => prev.map(e => e.id === eventId ? data.event : e))
      setEditingId(null)
      showToast('Event updated!', true)
    } catch { showToast('Network error.', false) }
  }

  // Create a new event
  const handleCreateEvent = async (form) => {
    try {
      const res = await fetch('/api/admin/events/create', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Create failed.', false); return }
      setEvents(prev => [...prev, data.event])
      setShowNewCard(false)
      showToast('New event created!', true)
    } catch { showToast('Network error.', false) }
  }

  // Register for an event (returns result for EventCard's local state update)
  const handleRegister = async (eventId) => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method:'POST' })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Registration failed.', false); return null }
      showToast('Registered successfully!', true)
      return data
    } catch { showToast('Network error.', false); return null }
  }

  // Open attendance list for a past event in a new tab
  const handleCheckAttendance = (eventId) => {
    window.open(`/admin/attendance-list/${eventId}`, '_blank', 'noopener,noreferrer')
  }

  if (!adminProfile) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color:'#00e5ff', fontFamily:'Inter,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid rgba(0,229,255,.2)', borderTopColor:'#00e5ff', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }}/>
        Loading Event Control…
      </div>
    </div>
  )

  const live     = events.filter(e => e.status === 'live')
  const upcoming = events.filter(e => e.status === 'upcoming')
  const past     = events.filter(e => e.status === 'past')

  const tabs = [
    { key:'live',     label:'Live',     count:live.length,     color:'#ff4444' },
    { key:'upcoming', label:'Upcoming', count:upcoming.length, color:'#00e5ff' },
    { key:'past',     label:'Past',     count:past.length,     color:'#888' },
  ]

  const currentEvents = activeTab==='live' ? live : activeTab==='upcoming' ? upcoming : past

  return (
    <div style={{ minHeight:'100vh', padding:'7rem 2rem 4rem', fontFamily:'Inter,sans-serif', maxWidth:1260, margin:'0 auto' }}>
      <style>{`
        @keyframes pulse-dot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        @keyframes spin        { to { transform:rotate(360deg) } }
        @keyframes slide-up    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes toast-in    { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:none} }
        @keyframes card-expand { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .ae-btn { border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:.84rem; padding:.5rem 1rem; transition:opacity .18s,transform .12s; font-family:Inter,sans-serif; }
        .ae-btn:hover { opacity:.82; transform:scale(.97); }
        .ae-tab { background:none; border:none; cursor:pointer; padding:.48rem 1.15rem; border-radius:8px; font-weight:600; transition:all .2s; font-family:Inter,sans-serif; }
        .ae-input { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.11); border-radius:8px; color:#fff; padding:.58rem .85rem; width:100%; box-sizing:border-box; font-family:Inter,sans-serif; outline:none; transition:border .2s,box-shadow .2s; font-size:.88rem; }
        .ae-input:focus { border-color:#00e5ff; box-shadow:0 0 10px rgba(0,229,255,.22); }
        .ae-input option { background:#0a0a1a; }
        .ae-label { font-size:.72rem; color:#666; margin-bottom:.35rem; display:block; text-transform:uppercase; letter-spacing:.06em; }
        .ae-title-input { font-size:1rem !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: '2.5rem', animation: 'slide-up .5s ease' }}>
        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem', marginTop: 0 }}>
          <Typewriter text="Event " speed={60} />
          <span className="text-gradient">
            <Typewriter text="Hub" speed={60} delay={400} />
          </span>
          <span style={{ fontSize: '1rem', color: '#666', fontWeight: 400, marginLeft: '1.5rem', verticalAlign: 'middle', textShadow: 'none' }}>
            [ Admin Control: <span style={{ color: '#00e5ff', fontWeight: 600 }}>{adminProfile.name}</span> — {adminProfile.role} ]
          </span>
        </h1>
        <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>Configure workshops, launch live QR attendance counters, and review check-in registers.</p>
      </div>

      {/* ── Tabs & Create Action ── */}
      <div className="top-nav-buttons" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {tabs.map((t, idx) => {
            const isActive = activeTab === t.key
            return (
              <button key={t.key}
                className={`top-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(t.key)}
                style={{
                  fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                  fontSize: '.88rem',
                  letterSpacing: '-.01em',
                  padding: '.5rem 1.15rem',
                  background: isActive ? `${t.color}12` : 'rgba(255,255,255,.025)',
                  border: `1px solid ${isActive ? t.color + '45' : 'rgba(255,255,255,.07)'}`,
                  borderRadius: 10,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  boxShadow: isActive ? `0 0 16px ${t.color}28` : 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 0,
                }}
              >
                <span style={{ color: isActive ? t.color : '#333', fontWeight: 700, transition: 'color .2s' }}>&lt;</span>
                <span style={{ color: isActive ? '#fff' : '#555', margin: '0 .12rem', transition: 'color .2s' }}>{t.label}</span>
                <span style={{ color: isActive ? t.color : '#333', fontWeight: 700, transition: 'color .2s' }}>/&gt;</span>
              </button>
            )
          })}
        </div>

        {activeTab === 'upcoming' && (
          <button 
            className="btn-primary" 
            onClick={() => { setShowNewCard(true); setEditingId(null); }}
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            + New Event
          </button>
        )}
      </div>

      {/* ── Cards grid ── */}
      <div className="grid grid-3" style={{ gap: '1.5rem', marginTop: '2rem' }}>

        {/* Inline New Event creation form */}
        {activeTab === 'upcoming' && showNewCard && (
          <EditableCard
            key="new-event"
            isNew={true}
            onSave={handleCreateEvent}
            onCancel={() => setShowNewCard(false)}
          />
        )}

        {currentEvents.map(event => {
          const editable = canEdit(adminProfile.role, adminProfile.domain, event.domain)
          const isEditing = editingId === event.id

          if (isEditing) {
            return (
              <EditableCard
                key={event.id}
                event={event}
                isNew={false}
                accentColor={(DOMAIN_COLORS[event.domain] || DOMAIN_COLORS['General']).neon}
                onSave={(form) => handleSaveEdit(event.id, form)}
                onCancel={() => setEditingId(null)}
              />
            )
          }

          return (
            <EventCard
              key={event.id}
              event={event}
              editable={editable}
              liveSecsLeft={liveTimers[event.id] || 30}
              onEdit={() => { setEditingId(event.id); setShowNewCard(false) }}
              onGoLive={() => handleGoLive(event.id)}
              onAttendance={() => handleAttendance(event.id)}
              onRegister={handleRegister}
              onCheckAttendance={() => handleCheckAttendance(event.id)}
            />
          )
        })}

        {/* Add Event card block removed */}

        {/* Empty state */}
        {currentEvents.length === 0 && !showNewCard && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', color:'#444', padding:'3rem', fontSize:'1rem' }}>
            No {activeTab} events right now.
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:'fixed', bottom:'2rem', right:'2rem',
          background: toast.success ? 'rgba(0,255,127,.1)' : 'rgba(255,68,68,.1)',
          border:`1px solid ${toast.success ? '#00ff7f' : '#ff4444'}`,
          color: toast.success ? '#00ff7f' : '#ff6b6b',
          padding:'.85rem 1.4rem', borderRadius:12, fontWeight:600, fontSize:'.88rem',
          animation:'toast-in .28s ease', zIndex:10000,
          boxShadow:`0 0 20px ${toast.success ? 'rgba(0,255,127,.18)' : 'rgba(255,68,68,.18)'}`,
        }}>
          {toast.success ? '✅ ' : '⚠️ '}{toast.text}
        </div>
      )}
    </div>
  )
}
