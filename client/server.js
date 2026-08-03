import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Stateful In-Memory Database
let database = {
  profile: {
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
  },
  adminProfile: {
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
  },
  events: [
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
  ],
  projects: [
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
    },
    {
      id: 6,
      title: "CTF Guard",
      username: "kabir_m",
      techStack: "Go · WebSockets",
      description: "Lightweight monitoring agent to track host intrusion during CTF events.",
      jmxReward: 180,
      coverImage: "https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&w=800&q=80",
      status: "Verified",
      category: "project"
    }
  ],
  team: [
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
  ],
  verificationsQueue: [],
  approvedProjectsHistory: []
}

const ROLE_HIERARCHY = {
  "Technical Secretary": 4,
  "Club Co-Manager": 3,
  "Domain Lead": 2,
  "Domain Specialist": 1
}

// ─── Utility: Generate time-windowed QR token ──────────────────────────────
// Token is valid for a 30-second window. We allow ±1 window for clock skew.
function generateToken(eventId, windowOffset = 0) {
  const window = Math.floor(Date.now() / 30000) + windowOffset
  return Buffer.from(`${eventId}-${window}`).toString('base64').replace(/=/g, '')
}

function isValidToken(eventId, token) {
  for (const offset of [0, -1, 1]) {
    if (generateToken(eventId, offset) === token) return true
  }
  return false
}

// ─── Public Endpoints ──────────────────────────────────────────────────────

app.get('/api/about', (req, res) => {
  res.json({
    heroSubtitle: "The official hub for IIT Jammu's developer ecosystem.",
    descriptionParagraph1: "Coding Club IIT Jammu is a group of passionate coders aimed at the overall development of coding culture in the college by introducing basic coding concepts to students who are new to the programming world and rendering a collaborative environment to the coders of the college along with providing technical assistance like websites, apps etc in college fests and other clubs.",
    descriptionParagraph2: "The club aims at introducing a diversity of inclinations in coding to the students so that they can pursue what interests them. They regularly hold sessions on various topics such as Machine learning, Competitive Coding, Web Development, App Development, Security and Open Source.",
    mission: "To cultivate a robust ecosystem of innovation, learning, and peer-to-peer mentorship.",
    vision: "Empowering every student to construct world-class software."
  })
})

app.get('/api/projects', (req, res) => res.json(database.projects))
app.get('/api/events', (req, res) => res.json(database.events))

app.post('/api/events/verify', (req, res) => {
  const { eventId, token } = req.body
  if (token && token.length === 6 && /^\d+$/.test(token)) {
    let targetEvent = database.events.find(e => e.id === eventId)
    if (!targetEvent) return res.status(404).json({ success: false, message: 'Event not found.' })
    if (targetEvent.attended) return res.status(400).json({ success: false, message: 'Already verified.' })
    targetEvent.attended = true
    targetEvent.status = 'past'
    database.profile.jmxScore += targetEvent.jmxPoints
    database.profile.stats.eventsAttended += 1
    res.json({ success: true, jmxEarned: targetEvent.jmxPoints })
  } else {
    res.status(400).json({ success: false, message: 'Invalid token.' })
  }
})

app.post('/api/events/:id/register', (req, res) => {
  const eventId = parseInt(req.params.id)
  let targetEvent = database.events.find(e => e.id === eventId)
  if (!targetEvent) return res.status(404).json({ error: 'Event not found.' })
  if (targetEvent.registered) return res.status(400).json({ error: 'Already registered.' })
  targetEvent.registered = true
  targetEvent.registeredCount = (targetEvent.registeredCount || 0) + 1
  res.json({ success: true, registeredCount: targetEvent.registeredCount })
})

app.get('/api/team', (req, res) => res.json(database.team))

// ─── Student Profile ───────────────────────────────────────────────────────

app.get('/api/profile', (req, res) => res.json(database.profile))

app.post('/api/profile/bind', (req, res) => {
  const { platform, handle } = req.body
  if (platform && database.profile.accounts.hasOwnProperty(platform)) {
    database.profile.accounts[platform] = handle
    res.json(database.profile)
  } else {
    res.status(400).json({ error: 'Unsupported platform.' })
  }
})

app.get('/api/profile/submissions', (req, res) => {
  const pending = database.verificationsQueue.filter(p => p.username === 'rohit_dev').map(p => ({ ...p, status: 'Pending Verification' }))
  const approved = database.projects.filter(p => p.username === 'rohit_dev').map(p => ({ ...p, status: 'Verified' }))
  res.json({ submissions: [...pending, ...approved] })
})

app.post('/api/projects/submit', (req, res) => {
  const { title, techStack, description, github, category } = req.body
  if (!title || !description) return res.status(400).json({ error: 'Title and description required.' })
  const newSubmission = {
    id: Date.now(), title, username: "rohit_dev", timeLabel: "Just now",
    github: github || "#", techStack: techStack || "General Software", description, category: category || "project"
  }
  database.verificationsQueue.push(newSubmission)
  res.status(201).json({ success: true, project: newSubmission })
})

// ─── QR Attendance System ──────────────────────────────────────────────────

// Get current rotating QR token for an event (used by AttendanceHost page)
app.get('/api/admin/events/:id/qrtoken', (req, res) => {
  const eventId = parseInt(req.params.id)
  const event = database.events.find(e => e.id === eventId)
  if (!event) return res.status(404).json({ error: 'Event not found.' })
  if (event.status !== 'live') return res.status(400).json({ error: 'Event is not live.' })

  const token = generateToken(eventId)
  // Time remaining in current 30-second window (milliseconds)
  const msIntoWindow = Date.now() % 30000
  const msRemaining = 30000 - msIntoWindow

  res.json({
    token,
    eventId,
    eventTitle: event.title,
    msRemaining,
    // QR URL encodes the attendance scan link
    qrUrl: `http://localhost:3000/attend/${token}?eid=${eventId}`
  })
})

// Student scans QR code — verify token and mark attendance
app.post('/api/attendance/scan', (req, res) => {
  const { token, eventId, username = 'rohit_dev' } = req.body

  if (!token || !eventId) return res.status(400).json({ success: false, message: 'Token and eventId required.' })

  const event = database.events.find(e => e.id === parseInt(eventId))
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' })
  if (event.status !== 'live') return res.status(400).json({ success: false, message: 'This event is not currently live.' })

  // Validate the time-windowed token
  if (!isValidToken(parseInt(eventId), token)) {
    return res.status(400).json({ success: false, message: 'QR code has expired. Ask the host to refresh.' })
  }

  // Check if already attended
  if (!event.attendees) event.attendees = []
  if (event.attendees.includes(username)) {
    return res.status(400).json({ success: false, message: 'Attendance already recorded for this session.' })
  }

  // Mark attendance
  event.attendees.push(username)
  database.profile.jmxScore += event.jmxPoints
  database.profile.stats.eventsAttended += 1
  // Also mark the student's profile attended flag
  event.attended = true

  res.json({
    success: true,
    message: `Attendance confirmed for ${event.title}!`,
    jmxEarned: event.jmxPoints,
    eventTitle: event.title
  })
})

// ─── Admin Operations ──────────────────────────────────────────────────────

app.get('/api/admin/profile', (req, res) => res.json(database.adminProfile))

app.post('/api/admin/profile/avatar', (req, res) => {
  const { avatar } = req.body
  if (avatar) {
    database.adminProfile.avatar = avatar
    res.json(database.adminProfile)
  } else {
    res.status(400).json({ error: 'No avatar data supplied.' })
  }
})

// Edit any event (domain-gated on the frontend)
app.put('/api/admin/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id)
  const event = database.events.find(e => e.id === eventId)
  if (!event) return res.status(404).json({ error: 'Event not found.' })

  const { title, description, dateLabel, location, jmxPoints, coverImage, type } = req.body
  if (title) event.title = title
  if (description) event.description = description
  if (dateLabel) event.dateLabel = dateLabel
  if (location) event.location = location
  if (jmxPoints) event.jmxPoints = parseInt(jmxPoints)
  if (coverImage) event.coverImage = coverImage
  if (type) event.type = type.toUpperCase()

  res.json({ success: true, event })
})

// Make an upcoming event go live
app.post('/api/admin/events/:id/golive', (req, res) => {
  const eventId = parseInt(req.params.id)
  const event = database.events.find(e => e.id === eventId)
  if (!event) return res.status(404).json({ error: 'Event not found.' })
  if (event.status !== 'upcoming') return res.status(400).json({ error: 'Only upcoming events can be made live.' })

  event.status = 'live'
  event.dateLabel = 'LIVE NOW'
  res.json({ success: true, event })
})

// Create new event
app.post('/api/admin/events/create', (req, res) => {
  const { title, type, dateLabel, description, jmxPoints, coverImage, location, domain } = req.body
  if (!title || !type || !description) return res.status(400).json({ error: 'Title, type, and description required.' })

  const newEvent = {
    id: database.events.length + 1,
    title, type: type.toUpperCase(),
    domain: domain || 'General',
    dateLabel: dateLabel || "TBD",
    description,
    jmxPoints: parseInt(jmxPoints) || 50,
    status: "upcoming",
    coverImage: coverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    location: location || "Campus Lecture Hall",
    registeredCount: 0,
    registered: false,
    attendees: []
  }
  database.events.push(newEvent)
  res.status(201).json({ success: true, event: newEvent })
})

// Showcase a project
app.post('/api/admin/projects/create', (req, res) => {
  const { title, username, techStack, description, coverImage, github } = req.body
  if (!title || !description) return res.status(400).json({ error: 'Title and description required.' })
  const newProject = {
    id: database.projects.length + 1,
    title, username: username || "anonymous",
    techStack: techStack || "General Software", description,
    coverImage: coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    status: "Verified", category: "project", github: github || "#"
  }
  database.projects.push(newProject)
  res.status(201).json({ success: true, project: newProject })
})

// Hire member
app.post('/api/admin/members/hire', (req, res) => {
  const { username, role, domain, briefRole } = req.body
  const recruiterLevel = ROLE_HIERARCHY[database.adminProfile.role] || 1
  const targetLevel = ROLE_HIERARCHY[role] || 1
  if (targetLevel >= recruiterLevel) {
    return res.status(403).json({ error: `Access Denied: Cannot hire a ${role} as a ${database.adminProfile.role}.` })
  }
  const name = username.replace('_dev', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const newMember = {
    id: database.team.length + 1, name, username: username || "new_hire",
    role: `${role} (${domain || 'General'})`,
    category: role.includes('Lead') ? 'lead' : role.includes('Specialist') ? 'specialist' : 'coordinator',
    bio: briefRole || "Newly recruited.", avatar: "https://i.pravatar.cc/300?img=20", github: "#", linkedin: "#"
  }
  database.team.push(newMember)
  res.status(201).json({ success: true, member: newMember })
})

// Transfer role
app.post('/api/admin/jobs/transfer', (req, res) => {
  const { targetUsername, bio, github, linkedin } = req.body
  if (!targetUsername) return res.status(400).json({ error: 'Target username required.' })
  const transferredRole = database.adminProfile.role
  const targetName = targetUsername.replace('_dev', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const idx = database.team.findIndex(m => m.name.toLowerCase() === targetName.toLowerCase())
  if (idx !== -1) {
    database.team[idx].role = transferredRole
    if (bio) database.team[idx].bio = bio
    if (github) database.team[idx].github = github
    if (linkedin) database.team[idx].linkedin = linkedin
  } else {
    database.team.push({
      id: database.team.length + 1, name: targetName, username: targetUsername,
      role: transferredRole, category: 'coordinator',
      bio: bio || "Acquired via administrative transfer.", avatar: "https://i.pravatar.cc/300?img=33",
      github: github || '#', linkedin: linkedin || '#'
    })
  }
  database.adminProfile.name = targetName
  database.adminProfile.accounts.github = targetUsername
  res.json({ success: true, message: `Transferred role '${transferredRole}' to ${targetName}.` })
})

// Get attendee list for a past event
// In production: JOIN events.attendees with users table for full profile data.
// Here we enrich the stored username array with mock profile data.
app.get('/api/admin/events/:id/attendees', (req, res) => {
  const eventId = parseInt(req.params.id)
  const event = database.events.find(e => e.id === eventId)
  if (!event) return res.status(404).json({ error: 'Event not found.' })

  // Domain → neon colour mapping (mirrors frontend)
  const domainColors = {
    'Web Dev':   '#00e5ff',
    'AI/ML':     '#a855f7',
    'CP':        '#f59e0b',
    'Cyber sec': '#ff4444',
    'Game Dev':  '#00ff7f',
    'General':   '#00e5ff',
  }

  // Mock student registry — backend team replaces with DB lookup
  const studentRegistry = {
    'rohit_dev':   { name: 'Rohit Sharma',   role: 'Student',         domain: 'Web Dev',  branch: 'B.Tech Electrical', checkedInAt: '10:02 AM' },
    'aryancodes':  { name: 'Aryan Kumar',     role: 'Tech Secretary',  domain: 'General',  branch: 'B.Tech CSE',        checkedInAt: '10:05 AM' },
    'priya_s':     { name: 'Priya Singh',     role: 'Co-Manager',      domain: 'General',  branch: 'B.Tech ECE',        checkedInAt: '10:07 AM' },
    'rohan_g':     { name: 'Rohan Gupta',     role: 'CP Lead',         domain: 'CP',       branch: 'B.Tech CSE',        checkedInAt: '10:10 AM' },
    'sneha_r':     { name: 'Sneha Reddy',     role: 'AI/ML Lead',      domain: 'AI/ML',    branch: 'B.Tech CSE',        checkedInAt: '10:13 AM' },
    'kabir_m':     { name: 'Kabir Malhotra',  role: 'CySec Lead',      domain: 'Cyber sec',branch: 'B.Tech CSE',        checkedInAt: '10:15 AM' },
  }

  // Enrich each username in attendees[]
  const attendees = (event.attendees || []).map(username => {
    const profile = studentRegistry[username] || {
      name: username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      role: 'Student', domain: 'General', branch: 'B.Tech', checkedInAt: '—'
    }
    return {
      username,
      name:        profile.name,
      role:        profile.role,
      domain:      profile.domain,
      domainColor: domainColors[profile.domain] || '#00e5ff',
      branch:      profile.branch,
      checkedInAt: profile.checkedInAt,
    }
  })

  res.json({
    event: {
      id:             event.id,
      title:          event.title,
      domain:         event.domain,
      dateLabel:      event.dateLabel,
      location:       event.location,
      jmxPoints:      event.jmxPoints,
      registeredCount: event.registeredCount || attendees.length,
    },
    attendees,
  })
})

app.listen(PORT, () => {
  console.log(`Mock Backend Server listening on http://localhost:${PORT}`)
})

