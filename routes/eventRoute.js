const express = require('express');
const router  = express.Router();
const {
  getPendingEvents,
  getAllEventsAdmin,
  approveEvent,
  rejectEvent,
  resetEvent,
  createStudentEvent,
  registerForEvent,
  unregisterFromEvent
} = require('../controllers/eventController');
const { requireAuth } = require('../middleware/authMiddleware');

// POST /api/events — student submits a new event
router.post('/', requireAuth, createStudentEvent);

// POST   /api/events/:id/register — register student
// DELETE /api/events/:id/register — unregister student
router.post('/:id/register',   requireAuth, registerForEvent);
router.delete('/:id/register', requireAuth, unregisterFromEvent);

// GET /api/events/pending — dashboard stat card + preview table
router.get('/pending', getPendingEvents);

// GET /api/events/admin/all — events panel (all statuses)
router.get('/admin/all', getAllEventsAdmin);

// PUT /api/events/admin/:id/approve
router.put('/admin/:id/approve', approveEvent);

// PUT /api/events/admin/:id/reject  body: { reason?: string }
router.put('/admin/:id/reject', rejectEvent);

// PUT /api/events/admin/:id/reset
router.put('/admin/:id/reset', resetEvent);

module.exports = router;