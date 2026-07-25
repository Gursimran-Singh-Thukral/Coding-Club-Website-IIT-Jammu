const express = require('express')
const { markAttendance, getEventAttendance } = require('../controllers/attendanceController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');

const router = express.Router();

// Students Marking Attendance

router.post('/', verifyAuth, markAttendance);

// Managers can view the Attendance for an Event

router.get('/:eventId', verifyAuth, requireManager, getEventAttendance);

module.exports = router;