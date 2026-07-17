/**
 * 
 * Main Application Entry Point
 * 
 * Initializes the Express server, configures global middleware, 
 * establishes the database connection, and defines core routing logic.
 * 
 */

// Core Imports

require('dotenv').config();
const express = require('express');

// Database and Middleware Imports

const supabase = require('./db/supabaseClient');
const { verifyInstituteEmail, requireRole } = require('./middleware/authCheck');

// Route Imports

// Initialize Express App

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware

app.use(express.json());                  // Parses Incoming JSON data from the Frontend Request

// Traffic Routing

/**
 * 
 * Health Check Endpoint
 * Route: GET /api/status
 * Purpose: Verifies server operational status and basic connectivity for load balancers or client checks.
 * 
 */

app.get('/api/status', (req, res) => {

    console.log("Incoming Ping Detected at /api/status!");

    res.status(200).json({

        status: "Success",
        message: "Coding Club Backend is Operational",
        timestamp: new Date().toISOString()

    });

});

/**
 * 
 * Protected Test Endpoint (Secure)
 * Route: GET /api/protected-test
 * Purpose: Validates that the authCheck middleware correctly intercepts and validates JWTs.
 * 
 */

app.get('/api/protected-test', verifyInstituteEmail, (req, res) => {

    // If the Code reaches here, the middleware's next() function is called.

    req.status(200).json({

        status: "Success",
        message: "Access Granted. Security Clearance Verified",
        authenticatedUser: req.user.email

    });

});

/**
 * 
 * Admin-Only Test Endpoint (Highly Secure)
 * Route: GET /api/admin-test
 * Purpose: Validates that chained middleware correctly enforces authentication AND authorization.
 * 
 */

app.get(

    '/api/admin-test', 
    verifyInstituteEmail,
    requireRole(['Manager', 'Field Specialist']),
    (req, res) => {

        res.status(200).json({

            status: "Success",
            message: "Admin Access Granted. You are authorized to manage Projects and JmX.",
            role: req.userRole

        });

    }

);

// Global Error Handler

app.use((err, req, res, next) => {

    console.error("Server Error Intercepted: ", err.message);
    res.status(500).json({error: "Internal Server Error. Please try again!"});

});

// Bind the Application to the Specified Port and Start Listening for Incoming HTTP Requests

app.listen(PORT, () => {

    console.log(`[Server] Initialization Complete. Listening on https://localhost:${PORT}`);
    console.log(`[Database] Supabase Connection Active`);

});