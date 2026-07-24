/**

    @fileoverview Event Routes.
    Defines the Endpoints for Creating and Viewing Events.

*/

const express = require('express');
const { createEvent, getEvents } =  require('../controllers/eventController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');

const router = express.Router();

// Router: GET /api/events 

router.get('/', getEvents);

// Router: POST /api/events (Protected - Only Logged-in Users can create)

router.post('/', verifyAuth, requireManager, createEvent);

module.exports = router;