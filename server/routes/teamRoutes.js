/**

    @fileoverview Team Routes.
    Defines the Endpoints for Viewing and Managing the Public Team Roster.

*/

const express = require('express');
const { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require('../controllers/teamController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireCoordinator } = require('../middleware/roleMiddleware');

const router = express.Router();

// Router: GET /api/team

router.get('/', getTeamMembers);

// Router: POST /api/team (Protected - Coordinators Only)

router.post('/', verifyToken, requireCoordinator, createTeamMember);

// Router: PUT /api/team/:id (Protected - Coordinators Only)

router.put('/:id', verifyToken, requireCoordinator, updateTeamMember);

// Router: DELETE /api/team/:id (Protected - Coordinators Only)

router.delete('/:id', verifyToken, requireCoordinator, deleteTeamMember);

module.exports = router;
