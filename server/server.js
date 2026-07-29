/**

    @fileoverview Main Point for the Coding Club API.
    Handles server Initialization, Middleware Configuration, and Route Mounting.

*/

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

const supabase = require('./config/supabaseClient');

const { verifyAuth } = require('./middleware/authMiddleware');

const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Middleware

app.use(cors());            // Allows Frontend to Connect with Backend
app.use(express.json());    // Allows Express to Parse JSON Bodies in Requests

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

app.get('/test-auth', verifyAuth, (req, res) => {

    res.status(200).json({

        status: 'Success',
        message: 'Authentication Test is Passed',
        user_email: req.user.email,
        user_id: req.user.id

    });

});

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/profiles', profileRoutes);

// Server Initialization

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`[Server] Initialization Complete. Listening on Port ${PORT}`);

});