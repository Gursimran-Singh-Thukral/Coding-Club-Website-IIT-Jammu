const express = require('express');
const router = express.Router();

const { submitProject } = require('../controllers/projectController');
const { verifyInstituteEmail } = require('../middleware/authCheck');

/*

    Route: POST /api/project/submit
    Protection: Must have a valid token
    Purpose: Allows Students to Submit a new Project for Review

*/

router.post('/submit', verifyInstituteEmail, submitProject);

module.exports = router;