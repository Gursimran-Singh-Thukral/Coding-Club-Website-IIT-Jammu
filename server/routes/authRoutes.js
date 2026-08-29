const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
    handleGoogleLogin,
    refreshAccessToken,
    logout,
    listSessions,
    revokeSession,
    revokeOtherSessions
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// PRD Requirement: Sign-Up and Authentication Endpoints Must be Strictly Rate-Limited

const authLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'Error', message: 'Too Many Attempts. Please Try Again Later.' }

});

router.post('/google', authLimiter, handleGoogleLogin);
router.post('/refresh', authLimiter, refreshAccessToken);
router.post('/logout', logout);

router.get('/sessions', verifyToken, listSessions);
router.delete('/sessions/:id', verifyToken, revokeSession);
router.post('/sessions/revoke-others', verifyToken, revokeOtherSessions);

module.exports = router;
