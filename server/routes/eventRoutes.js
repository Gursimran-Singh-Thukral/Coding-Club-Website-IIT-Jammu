/**

    @fileoverview Event Routes.
    Defines the Endpoints for Creating and Viewing Events, Plus Registration
    (Individual/Team Sign-up) and the Shared In-Browser Team Workspace.

*/

const express = require('express');
const { createEvent, getEvents, updateEvent, deleteEvent, getEventSecret, getEventPs, startLivestream, stopLivestream } =  require('../controllers/eventController');
const {
    createTeam, joinTeam, getMyTeam, leaveTeam, listRegistrations, removeTeam
} = require('../controllers/registrationController');
const {
    getMySubmission, saveMySubmission, listSubmissions, getTeamSubmission, evaluateSubmission
} = require('../controllers/submissionController');
const { verifyToken, verifyTokenOptional } = require('../middleware/authMiddleware');
const { requireCoordinator } = require('../middleware/roleMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const { uploadImage } = require('../controllers/workspaceController');
const { inviteToEvent, getEventInvites, revokeInvite } = require('../controllers/inviteController');
const { getChallenges, createChallenge, submitFlag, getLeaderboard } = require('../controllers/ctfController');

const router = express.Router();

// Router: GET /api/events

router.get('/', verifyTokenOptional, getEvents);
router.get('/:id/secret', verifyToken, requireCoordinator, getEventSecret);
router.get('/:id/ps', verifyToken, getEventPs);

// Router: POST /api/events (Protected - Only Logged-in Users can create)

router.post('/', verifyToken, requireCoordinator, createEvent);

// Router: PUT /api/events (Protected - Only Logged-in Users can update)

router.put('/:id', verifyToken, requireCoordinator, updateEvent);

// Router: DELETE /api/events (Protected - Only Logged-in Users can delete)

router.delete('/:id', verifyToken, requireCoordinator, deleteEvent);
router.post('/:id/livestream/start', verifyToken, requireCoordinator, startLivestream);
router.post('/:id/livestream/stop', verifyToken, requireCoordinator, stopLivestream);

// Router: Private Event Invites

router.post('/:id/invites', verifyToken, requireCoordinator, inviteToEvent);
router.get('/:id/invites', verifyToken, requireCoordinator, getEventInvites);
router.delete('/:id/invites/:studentId', verifyToken, requireCoordinator, revokeInvite);

// Router: CTF

router.get('/:id/ctf/challenges', verifyToken, getChallenges);
router.post('/:id/ctf/challenges', verifyToken, requireCoordinator, createChallenge);
router.post('/:id/ctf/challenges/:challengeId/submit', verifyToken, submitFlag);
router.get('/:id/ctf/leaderboard', verifyToken, getLeaderboard);

// Router: Registration (Individual or Team Sign-up)

router.post('/:id/teams', verifyToken, createTeam);
router.post('/:id/teams/join', verifyToken, joinTeam);
router.get('/:id/teams/me', verifyToken, getMyTeam);
router.delete('/:id/teams/me', verifyToken, leaveTeam);
router.get('/:id/registrations', verifyToken, requireCoordinator, listRegistrations);
router.delete('/:id/teams/:teamId', verifyToken, requireCoordinator, removeTeam);

// Router: Shared In-Browser Team Workspace (HTML/CSS/JS - Client-Rendered Only)

router.get('/:id/submission', verifyToken, getMySubmission);
router.put('/:id/submission', verifyToken, saveMySubmission);
router.get('/:id/submissions', verifyToken, requireCoordinator, listSubmissions);
router.get('/:id/submissions/:teamId', verifyToken, requireCoordinator, getTeamSubmission);
router.put('/:id/submissions/:teamId/evaluate', verifyToken, requireCoordinator, evaluateSubmission);
router.post('/:id/workspace/upload', verifyToken, upload.single('image'), uploadImage);

module.exports = router;
