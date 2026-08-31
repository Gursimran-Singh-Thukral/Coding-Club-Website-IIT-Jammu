/*

    @fileoverview User Routes.
    Defines the Endpoints for User Profile Management.

*/

const express = require('express');
<<<<<<< Updated upstream
const { syncUserProfile } = require('../controllers/userController');
const { verifyAuth } = require('../middleware/authMiddleware');
=======
const { syncUserProfile, listUsers, updateUserRole } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireCoordinator } = require('../middleware/roleMiddleware');
>>>>>>> Stashed changes

const router = express.Router();

/*

    Route: GET /api/users/profile
    The verifyAuth middleware Runs First. If Successful, syncUserProfile Runs.

*/

router.get('/profile', verifyAuth, syncUserProfile);

// Route: GET /api/users - List Every Registered User (Coordinator-Only)

router.get('/', verifyToken, requireCoordinator, listUsers);

// Route: PUT /api/users/:id/role - Assign a Platform Role (Coordinator-Only)

router.put('/:id/role', verifyToken, requireCoordinator, updateUserRole);

module.exports = router;