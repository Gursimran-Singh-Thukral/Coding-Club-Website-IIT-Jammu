import React, { useState, useEffect } from 'react'

// ── AttendanceList ──────────────────────────────────────────────────────────
// Standalone page opened in a new tab from the admin past-event card.
// URL: /admin/attendance-list/:eventId
//
// Shows a full table of attendees with:
//   - Name, Username, Role/Domain, Branch, Time of check-in
//   - Search/filter bar
//   - Download as .CSV button (top-right)
// ───────────────────────────────────────────────────────────────────────────

function getEventId() {
  const m = window.location.pathname.match(/\/admin\/attendance-list\/(\d+)/)
  return m ? parseInt(m[1]) : null
}

function toCSV(rows, eventTitle) {
  const headers = ['#', 'Name', 'Username', 'Role', 'Domain', 'Branch', 'Check-in Time']
  const lines = [
    `Event: ${eventTitle}`,
    `Exported: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...rows.map((r, i) => [
      i + 1, r.name, r.username, r.role, r.domain, r.branch, r.checkedInAt
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  ]
  return lines.join('\r\n')
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function AttendanceList() {
  const [data, setData]       = useState(null)   // { event, attendees }
  const [query, setQuery]     = useState('')
  const [error, setError]     = useState(null)
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir]     = useState('asc')

  const eventId = getEventId()

  useEffect(() => {
    if (!eventId) { setError('Invalid event ID in URL.'); return }
    fetch(`/api/admin/events/${eventId}/attendees`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Failed to load attendance data. Is the server running?'))
  }, [eventId])

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleDownload = () => {
    if (!data) return
    const csv = toCSV(data.attendees, data.event.title)
    const slug = data.event.title.replace(/\s+/g, '_').toLowerCase()
    downloadCSV(csv, `attendance_${slug}.csv`)
  }

  const filtered = (data?.attendees || [])
    .filter(a => {
      const q = query.toLowerCase()
      return !q || a.username.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const va = String(a[sortField] || '').toLowerCase()
      const vb = String(b[sortField] || '').toLowerCase()
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color:'#333', marginLeft:4 }}>⇅</span>
    return <span style={{ color:'#00e5ff', marginLeft:4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const thStyle = {
    padding:'.7rem 1rem', textAlign:'left', fontSize:'.75rem', fontWeight:700,
    color:'#888', textTransform:'uppercase', letterSpacing:'.06em',
    borderBottom:'1px solid rgba(255,255,255,.07)', cursor:'pointer',
    userSelect:'none', whiteSpace:'nowrap',
  }

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#060610', display:'flex', justifyContent:'center', alignItems:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ textAlign:'center', color:'#ff4444' }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⚠️</div>
        <h2 style={{ marginBottom:'.5rem' }}>Error</h2>
        <p style={{ color:'#666' }}>{error}</p>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight:'100vh', background:'#060610', display:'flex', justifyContent:'center', alignItems:'center', fontFamily:'Inter,sans-serif', color:'#00e5ff' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid rgba(0,229,255,.2)', borderTopColor:'#00e5ff', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }}/>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        Loading attendance data…
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#060610 0%,#0a0a1e 100%)', fontFamily:'Inter,sans-serif', padding:'2.5rem 2rem 4rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        @keyframes spin      { to { transform:rotate(360deg) } }
        @keyframes fade-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes row-in    { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        .att-row { transition: background .15s; }
        .att-row:hover { background: rgba(0,229,255,.04) !important; }
        .att-th:hover { color: #ccc !important; }
        .dl-btn { transition: all .18s; }
        .dl-btn:hover { transform:translateY(-2px); box-shadow: 0 0 24px rgba(0,229,255,.35) !important; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,.02); }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem', animation:'fade-up .4s ease' }}>
        <div>
          {/* Breadcrumb */}
          <p style={{ margin:'0 0 .3rem', color:'#555', fontSize:'.78rem', textTransform:'uppercase', letterSpacing:'.08em' }}>
            Admin · Event Control · Past Events
          </p>
          <h1 style={{ margin:'0 0 .3rem', fontSize:'clamp(1.3rem,3vw,1.9rem)', fontWeight:800, color:'#fff' }}>
            {data.event.title}
          </h1>
          <p style={{ margin:0, color:'#555', fontSize:'.85rem' }}>
            {data.event.dateLabel} {data.event.location ? `· ${data.event.location}` : ''} · {data.event.domain}
          </p>
        </div>

        {/* Download CSV */}
        <button className="dl-btn" onClick={handleDownload} style={{
          display:'flex', alignItems:'center', gap:'.6rem',
          background:'linear-gradient(135deg,#00e5ff,#0072ff)', color:'#000',
          border:'none', borderRadius:10, padding:'.7rem 1.5rem',
          fontWeight:800, fontSize:'.88rem', cursor:'pointer', fontFamily:'Inter,sans-serif',
          boxShadow:'0 0 16px rgba(0,229,255,.2)', whiteSpace:'nowrap',
        }}>
          <span style={{ fontSize:'1rem' }}>⬇</span>
          Download .CSV
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'2rem', animation:'fade-up .5s ease' }}>
        {[
          { label:'Total Checked In',  val: data.attendees.length,                                                       col:'#00e5ff' },
          { label:'Attendance Rate', val: data.event.registeredCount ? `${Math.round((data.attendees.length / data.event.registeredCount) * 100)}%` : '—', col:'#00ff7f' },
        ].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,.04)', border:`1px solid ${s.col}25`, borderRadius:12, padding:'.75rem 1.4rem', minWidth:130 }}>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:s.col, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:'.72rem', color:'#666', marginTop:'.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div style={{ position:'relative', maxWidth:420, marginBottom:'1.5rem' }}>
        <span style={{ position:'absolute', left:'.9rem', top:'50%', transform:'translateY(-50%)', color:'#555', pointerEvents:'none', fontSize:'.95rem' }}>🔍</span>
        <input
          type="text"
          placeholder="Search by username…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width:'100%', boxSizing:'border-box',
            background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)',
            borderRadius:10, color:'#fff', padding:'.65rem .9rem .65rem 2.4rem',
            fontFamily:'Inter,sans-serif', fontSize:'.88rem', outline:'none',
            transition:'border .2s, box-shadow .2s',
          }}
          onFocus={e => { e.target.style.borderColor='#00e5ff'; e.target.style.boxShadow='0 0 10px rgba(0,229,255,.2)' }}
          onBlur={e => { e.target.style.borderColor='rgba(255,255,255,.1)'; e.target.style.boxShadow='none' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ position:'absolute', right:'.8rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:'1rem', lineHeight:1 }}>✕</button>
        )}
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', color:'#444', padding:'4rem', fontSize:'1rem' }}>
          {query ? `No students match "${query}"` : 'No attendance records for this event.'}
        </div>
      ) : (
        <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,.07)', animation:'fade-up .5s ease' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:620 }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,.03)' }}>
                  <th style={{ ...thStyle, width:48, cursor:'default' }}>#</th>
                  {[
                    { key:'name',      label:'Name' },
                    { key:'username',  label:'Username' },
                    { key:'role',      label:'Role' },
                    { key:'domain',    label:'Domain' },
                    { key:'branch',    label:'Branch' },
                    { key:'checkedInAt', label:'Check-in Time' },
                  ].map(col => (
                    <th key={col.key} className="att-th" style={thStyle} onClick={() => handleSort(col.key)}>
                      {col.label}<SortIcon field={col.key}/>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.username} className="att-row" style={{
                    background: i % 2 === 0 ? 'rgba(255,255,255,.016)' : 'transparent',
                    animation: `row-in .3s ${i * 0.025}s ease both`,
                  }}>
                    <td style={{ padding:'.7rem 1rem', color:'#444', fontSize:'.8rem', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,.04)' }}>{i + 1}</td>
                    <td style={{ padding:'.7rem 1rem', color:'#fff', fontWeight:600, fontSize:'.88rem', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#00e5ff22,#a855f722)', border:'1px solid rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:800, color:'#00e5ff', flexShrink:0 }}>
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        {a.name}
                      </div>
                    </td>
                    <td style={{ padding:'.7rem 1rem', color:'#888', fontSize:'.83rem', fontFamily:'monospace', borderBottom:'1px solid rgba(255,255,255,.04)' }}>@{a.username}</td>
                    <td style={{ padding:'.7rem 1rem', color:'#ccc', fontSize:'.83rem', borderBottom:'1px solid rgba(255,255,255,.04)' }}>{a.role}</td>
                    <td style={{ padding:'.7rem 1rem', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <span style={{
                        background: a.domainColor ? `${a.domainColor}18` : 'rgba(0,229,255,.1)',
                        color: a.domainColor || '#00e5ff',
                        border: `1px solid ${a.domainColor || '#00e5ff'}40`,
                        padding:'.18rem .6rem', borderRadius:20, fontSize:'.72rem', fontWeight:600,
                      }}>{a.domain}</span>
                    </td>
                    <td style={{ padding:'.7rem 1rem', color:'#777', fontSize:'.82rem', borderBottom:'1px solid rgba(255,255,255,.04)' }}>{a.branch}</td>
                    <td style={{ padding:'.7rem 1rem', color:'#555', fontSize:'.8rem', fontFamily:'monospace', borderBottom:'1px solid rgba(255,255,255,.04)' }}>{a.checkedInAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'.7rem 1.2rem', background:'rgba(255,255,255,.02)', borderTop:'1px solid rgba(255,255,255,.04)', color:'#555', fontSize:'.78rem' }}>
            Showing {filtered.length} of {data.attendees.length} attendees
          </div>
        </div>
      )}
    </div>
  )
}
