/**

    @fileoverview Event Routes.
    Defines the Endpoints for Creating and Viewing Events.

*/

const express = require('express');
const { createEvent, getEvents, updateEvent, deleteEvent } =  require('../controllers/eventController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');

const router = express.Router();

// Router: GET /api/events 

router.get('/', getEvents);

// Router: POST /api/events (Protected - Only Logged-in Users can create)

router.post('/', verifyAuth, requireManager, createEvent);

// Router: PUT /api/events (Protected - Only Logged-in Users can update)

router.put('/:id', verifyAuth, requireManager, updateEvent);

// Router: DELETE /api/events (Protected - Only Logged-in Users can delete)

router.delete('/:id', verifyAuth, requireManager, deleteEvent);

module.exports = router;