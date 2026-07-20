/**
 * 
 * User Routes
 * 
 * Maps HTTP requests to the corresponding User Controller functions.
 * Applies necessary security middleware before executing business logic.
 * 
 */

const express = require('express');
const router = express.Router();

const { syncUserProfile } = require('../controllers/userController');
const { verifyInstituteEmail } = require('../middleware/authCheck');

/**
 * 
 * Route: GET /api/users/profile
 * Protection: Must have a valid @iitjammu.ac.in token
 * Purpose: Fetches the database profile, creating it if it doesn't exist yet.
 * 
 */

router.get('/profile', verifyInstituteEmail, syncUserProfile);

module.exports = router;