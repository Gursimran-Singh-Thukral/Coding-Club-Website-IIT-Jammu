const express = require('express')
<<<<<<< Updated upstream
const { markAttendance, getEventAttendance } = require('../controllers/attendanceController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');
=======
const { markAttendance, getEventAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireCoordinator } = require('../middleware/roleMiddleware');
>>>>>>> Stashed changes

const router = express.Router();

// Students Marking Attendance

router.post('/', verifyAuth, markAttendance);

// Any Logged-In User can Check whether THEY have Checked In - Backs the Workspace Unlock Gate

<<<<<<< Updated upstream
router.get('/:eventId', verifyAuth, requireManager, getEventAttendance);
=======
router.get('/:eventId/me', verifyToken, getMyAttendance);

// Coordinators can view the Attendance for an Event

router.get('/:eventId', verifyToken, requireCoordinator, getEventAttendance);
>>>>>>> Stashed changes

module.exports = router;