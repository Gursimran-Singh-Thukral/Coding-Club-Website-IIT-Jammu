/*

    @fileoverview User Routes.
    Defines the Endpoints for User Profile Management.

*/

const express = require('express');
const { syncUserProfile } = require('../controllers/userController');
const { verifyAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/* 

    Route: GET /api/users/profile
    The verifyAuth middleware Runs First. If Successful, syncUserProfile Runs.

*/

router.get('/profile', verifyAuth, syncUserProfile);

module.exports = router;