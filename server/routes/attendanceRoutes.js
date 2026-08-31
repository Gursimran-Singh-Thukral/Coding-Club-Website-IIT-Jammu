const express = require('express')
const { markAttendance, getEventAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireCoordinator } = require('../middleware/roleMiddleware');

const router = express.Router();

// Students Marking Attendance

router.post('/', verifyToken, markAttendance);

// Any Logged-In User can Check whether THEY have Checked In - Backs the Workspace Unlock Gate

router.get('/:eventId/me', verifyToken, getMyAttendance);

// Coordinators can view the Attendance for an Event

router.get('/:eventId', verifyToken, requireCoordinator, getEventAttendance);

module.exports = router;