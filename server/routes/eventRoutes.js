/**

    @fileoverview Event Routes.
    Defines the Endpoints for Creating and Viewing Events, Plus Registration
    (Individual/Team Sign-up) and the Shared In-Browser Team Workspace.

*/

const express = require('express');
const { createEvent, getEvents, updateEvent, deleteEvent, getEventSecret, getEventPs } =  require('../controllers/eventController');
const {
    createTeam, joinTeam, getMyTeam, leaveTeam, listRegistrations, removeTeam
} = require('../controllers/registrationController');
const {
    getMySubmission, saveMySubmission, listSubmissions, getTeamSubmission, evaluateSubmission
} = require('../controllers/submissionController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireCoordinator } = require('../middleware/roleMiddleware');

const router = express.Router();

// Router: GET /api/events

router.get('/', getEvents);
router.get('/:id/secret', verifyToken, requireCoordinator, getEventSecret);
router.get('/:id/ps', verifyToken, getEventPs);

// Router: POST /api/events (Protected - Only Logged-in Users can create)

router.post('/', verifyToken, requireCoordinator, createEvent);

// Router: PUT /api/events (Protected - Only Logged-in Users can update)

router.put('/:id', verifyToken, requireCoordinator, updateEvent);

// Router: DELETE /api/events (Protected - Only Logged-in Users can delete)

router.delete('/:id', verifyToken, requireCoordinator, deleteEvent);

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

module.exports = router;
