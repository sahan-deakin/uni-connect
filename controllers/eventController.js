const eventService = require('../services/eventService');

// GET /api/events/pending
// Used by admin dashboard stat card + preview table
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await eventService.getPendingEvents();
    return res.json(events);
  } catch (err) {
    console.error('[getPendingEvents]', err);
    return res.status(500).json({ error: 'Failed to fetch pending events' });
  }
};

// GET /api/events/admin/all
// Used by admin Events panel (all statuses, filtered client-side)
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    return res.json(events);
  } catch (err) {
    console.error('[getAllEventsAdmin]', err);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// ── Admin moderation endpoints ───────────────────────────────────────────────

// PUT /api/events/admin/:id/approve
exports.approveEvent = async (req, res) => {
  try {
    const event = await eventService.approveEvent(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json({ message: 'Event approved', event });
  } catch (err) {
    console.error('[approveEvent]', err);
    return res.status(500).json({ error: 'Failed to approve event' });
  }
};

// PUT /api/events/admin/:id/reject
exports.rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await eventService.rejectEvent(req.params.id, reason || null);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json({ message: 'Event rejected', event });
  } catch (err) {
    console.error('[rejectEvent]', err);
    return res.status(500).json({ error: 'Failed to reject event' });
  }
};

// PUT /api/events/admin/:id/reset
exports.resetEvent = async (req, res) => {
  try {
    const event = await eventService.resetEvent(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json({ message: 'Event reset to pending', event });
  } catch (err) {
    console.error('[resetEvent]', err);
    return res.status(500).json({ error: 'Failed to reset event' });
  }
};