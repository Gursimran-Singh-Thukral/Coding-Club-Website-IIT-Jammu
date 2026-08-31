/**

    @fileoverview Event Routes.
    Defines the Endpoints for Creating and Viewing Events, Plus Registration
    (Individual/Team Sign-up) and the Shared In-Browser Team Workspace.

*/

const express = require('express');
const { createEvent, getEvents, updateEvent, deleteEvent, getEventSecret } =  require('../controllers/eventController');
<<<<<<< Updated upstream
const { verifyAuth } = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');
=======
const {
    createTeam, joinTeam, getMyTeam, leaveTeam, listRegistrations, removeTeam
} = require('../controllers/registrationController');
const {
    getMySubmission, saveMySubmission, listSubmissions, getTeamSubmission, evaluateSubmission
} = require('../controllers/submissionController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireCoordinator } = require('../middleware/roleMiddleware');
>>>>>>> Stashed changes

const router = express.Router();

// Router: GET /api/events

router.get('/', getEvents);
<<<<<<< Updated upstream
router.get('/:id/secret', verifyAuth, requireManager, getEventSecret);

// Router: POST /api/events (Protected - Only Logged-in Users can create)

router.post('/', verifyAuth, requireManager, createEvent);

// Router: PUT /api/events (Protected - Only Logged-in Users can update)

router.put('/:id', verifyAuth, requireManager, updateEvent);

// Router: DELETE /api/events (Protected - Only Logged-in Users can delete)

router.delete('/:id', verifyAuth, requireManager, deleteEvent);
=======
router.get('/:id/secret', verifyToken, requireCoordinator, getEventSecret);

// Router: POST /api/events (Protected - Only Logged-in Users can create)

router.post('/', verifyToken, requireCoordinator, createEvent);

// Router: PUT /api/events (Protected - Only Logged-in Users can update)

router.put('/:id', verifyToken, requireCoordinator, updateEvent);

// Router: DELETE /api/events (Protected - Only Logged-in Users can delete)

router.delete('/:id', verifyToken, requireCoordinator, deleteEvent);
>>>>>>> Stashed changes

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
