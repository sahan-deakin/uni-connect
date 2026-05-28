const express = require('express');
const router  = express.Router();
const {
  getPendingEvents,
  getAllEventsAdmin,
  approveEvent,
  rejectEvent,
  resetEvent
} = require('../controllers/eventController');

// ── Admin read ───────────────────────────────────────────────────────────────
// GET /api/events/pending        — dashboard stat card + preview table
router.get('/pending', getPendingEvents);

// GET /api/events/admin/all      — events panel (all statuses)
router.get('/admin/all', getAllEventsAdmin);

// ── Admin moderation ─────────────────────────────────────────────────────────
// PUT /api/events/admin/:id/approve
router.put('/admin/:id/approve', approveEvent);

// PUT /api/events/admin/:id/reject   body: { reason?: string }
router.put('/admin/:id/reject',  rejectEvent);

// PUT /api/events/admin/:id/reset
router.put('/admin/:id/reset',   resetEvent);

module.exports = router;