const express = require('express');
const { upsertProfile, getAllProfiles, getUserProfile } = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: Anyone Visiting the Website can see the Team Profiles

router.get('/', verifyToken, getUserProfile);

// Protected: A Logged-In User can Update their own Profile

router.post('/', verifyToken, upsertProfile);

router.get('/all', getAllProfiles);

module.exports = router;