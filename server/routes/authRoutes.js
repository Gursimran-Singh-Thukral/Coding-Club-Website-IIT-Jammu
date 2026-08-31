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

// PRD Requirement: Sign-Up and Authentication Endpoints Must be Strictly Rate-Limited.
//
// `skipSuccessfulRequests` is the key setting here: a burst of genuine logins
// (e.g. a whole campus signing in during a launch event) never consumes the
// bucket, since every one of those requests succeeds. Only repeated FAILURES
// (bad/expired tokens - the actual bot/brute-force signature) count against
// the limit. Login and refresh get separate buckets so a spike in one never
// locks out the other. Relies on `TRUST_PROXY=true` being set in production
// (see server.js) so `req.ip` reflects the real client, not the proxy.

const loginLimiter = rateLimit({

    windowMs: 10 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { status: 'Error', message: 'Too Many Login Attempts. Please Try Again Later.' }

});

const refreshLimiter = rateLimit({

    windowMs: 10 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { status: 'Error', message: 'Too Many Attempts. Please Try Again Later.' }

});

router.post('/google', loginLimiter, handleGoogleLogin);
router.post('/refresh', refreshLimiter, refreshAccessToken);
router.post('/logout', logout);

router.get('/sessions', verifyToken, listSessions);
router.delete('/sessions/:id', verifyToken, revokeSession);
router.post('/sessions/revoke-others', verifyToken, revokeOtherSessions);

module.exports = router;
