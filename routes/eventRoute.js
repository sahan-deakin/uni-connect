const express = require('express');
const router  = express.Router();
const { getPendingEvents, getAllEventsAdmin } = require('../controllers/eventController');

// GET /api/events/pending      — admin dashboard
router.get('/pending', getPendingEvents);

// GET /api/events/admin/all    — admin events panel
router.get('/admin/all', getAllEventsAdmin);

module.exports = router;