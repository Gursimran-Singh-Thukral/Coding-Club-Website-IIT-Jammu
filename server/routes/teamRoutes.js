/**

    @fileoverview Team Routes.
    Defines the Endpoints for Viewing and Managing the Public Team Roster.

*/

const express = require('express');
const { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require('../controllers/teamController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');

const router = express.Router();

// Router: GET /api/team

router.get('/', getTeamMembers);

// Router: POST /api/team (Protected - Managers Only)

router.post('/', verifyToken, requireManager, createTeamMember);

// Router: PUT /api/team/:id (Protected - Managers Only)

router.put('/:id', verifyToken, requireManager, updateTeamMember);

// Router: DELETE /api/team/:id (Protected - Managers Only)

router.delete('/:id', verifyToken, requireManager, deleteTeamMember);

module.exports = router;
