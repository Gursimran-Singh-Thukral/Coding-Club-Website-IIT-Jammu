/**

    @fileoverview Event Routes.
    Defines the Endpoints for Creating and Viewing Events.

*/

const express = require('express');
const { createEvent, getEvents, updateEvent, deleteEvent, getEventSecret } =  require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');

const router = express.Router();

// Router: GET /api/events 

router.get('/', getEvents);
router.get('/:id/secret', verifyToken, requireManager, getEventSecret);

// Router: POST /api/events (Protected - Only Logged-in Users can create)

router.post('/', verifyToken, requireManager, createEvent);

// Router: PUT /api/events (Protected - Only Logged-in Users can update)

router.put('/:id', verifyToken, requireManager, updateEvent);

// Router: DELETE /api/events (Protected - Only Logged-in Users can delete)

router.delete('/:id', verifyToken, requireManager, deleteEvent);

module.exports = router;