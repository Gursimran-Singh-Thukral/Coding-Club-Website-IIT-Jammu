const express = require('express');
const { upsertProfile, getAllProfiles } = require('../controllers/profileController');
const { verifyAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: Anyone Visiting the Website can see the Team Profiles

router.get('/', getAllProfiles);

// Protected: A Logged-In User can Update their own Profile

router.put('/me', verifyAuth, upsertProfile);

module.exports = router;