/**

    @fileoverview Main Point for the Coding Club API.
    Handles server Initialization, Middleware Configuration, and Route Mounting.

*/

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Behind a VM's reverse proxy, req.ip otherwise reports the proxy's address.
// Off by default so an untrusted X-Forwarded-For can't spoof it in local dev.

if(process.env.TRUST_PROXY === 'true'){

  app.set('trust proxy', 1);

} else if(process.env.NODE_ENV === 'production'){

  // Left unset in production, every request behind Railway's (or any) reverse
  // proxy resolves to the same req.ip, so the auth rate limiter treats every
  // visitor as one client - see authRoutes.js and .env.example.
  console.warn('[Server] WARNING: TRUST_PROXY is not "true" in production. req.ip will be wrong behind a reverse proxy, and the auth rate limiter will misfire for all clients sharing it.');

}

// Comma-Separated so a VM's Domain can be Added Alongside Localhost via .env Alone

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({

  origin: allowedOrigins,
  credentials: true                     // For Sending and Receiving Cookies

}));
   // Allows Frontend to Connect with Backend
// Middleware

// Raised from the 100kb default - team member photos are uploaded as base64
// data URIs in the JSON body (client-side compressed, but base64 still
// inflates size ~33% over the raw file).
app.use(express.json({ limit: '3mb' }));
app.use(cookieParser());

const supabase = require('./config/supabaseClient');

const { verifyToken } = require('./middleware/authMiddleware');

const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const profileRoutes = require('./routes/profileRoutes');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');

// Base Routes

/**

    @route GET /health
    @desc Verifies the Server is Operational and Responding.

*/

app.get('/health', (req, res) => {

    res.status(200).json({

        status: 'Success',
        message: 'Coding Club API is Live and Healthy.'

    });

});

/**

    @route GET /test-auth
    @desc A Temp Protected Route to Test our JWT Middleware.

*/

app.get('/test-auth', verifyToken, (req, res) => {

    res.status(200).json({

        status: 'Success',
        message: 'Authentication Test is Passed',
        user_email: req.user.email,
        user_id: req.user.id

    });

});

app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/users', userRoutes);

app.get('/api/about', (req, res) => {
  res.status(200).json({
    heroSubtitle: "The official hub for IIT Jammu's developer ecosystem.",
    descriptionParagraph1: "Coding Club IIT Jammu is a group of passionate coders.",
    descriptionParagraph2: "The club aims at introducing a diversity of inclinations in coding.",
    mission: "To cultivate a robust ecosystem of innovation, learning, and peer-to-peer mentorship.",
    vision: "Empowering every student to construct world-class software."
  });
});

app.get('/api/projects', (req, res) => {
  res.status(200).json({
    status: 'Success',
    data: [
      {
        id: 1,
        title: "NeuroTrack AI",
        techStack: "Machine Learning · React",
        description: "An AI-powered attendance tracking system.",
        github: "https://github.com",
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 2,
        title: "DefendChain",
        techStack: "Cybersecurity · Rust",
        description: "A decentralized blockchain auditing tool.",
        github: "https://github.com",
        coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
      }
    ]
  });
});

// Server Initialization

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`[Server] Initialization Complete. Listening on Port ${PORT}`);

});