const express = require('express')
const { markAttendance, getEventAttendance } = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');

const router = express.Router();

// Students Marking Attendance

router.post('/', verifyToken, markAttendance);

// Managers can view the Attendance for an Event

router.get('/:eventId', verifyToken, requireManager, getEventAttendance);

module.exports = router;