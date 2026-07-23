/*

    @fileoverview Main Point for the Coding Club API.
    Handles server Initialization, Middleware Configuration, and Route Mounting.

*/

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

const supabase = require('./config/supabaseClient');

// Middleware

app.use(cors());            // Allows Frontend to Connect with Backend
app.use(express.json());    // Allows Express to Parse JSON Bodies in Requests

// Base Routes

/*

    @route GET /health
    @desc Verifies the Server is Operational and Responding.

*/

app.get('/health', (req, res) => {

    res.status(200).json({

        status: 'Success',
        message: 'Coding Club API is Live and Healthy.'

    });

});

// Server Initialization

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`[Server] Initialization Complete. Listening on Port ${PORT}`);

});