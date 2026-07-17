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