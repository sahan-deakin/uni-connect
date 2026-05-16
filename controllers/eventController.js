const Event = require('../models/eventModel');

// GET /api/events/pending
// Used by admin dashboard stat card + preview table
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();
    return res.json(events);
  } catch (err) {
    console.error('[getPendingEvents]', err);
    return res.status(500).json({ error: 'Failed to fetch pending events' });
  }
};

// GET /api/events/admin/all
// Used by admin Events panel (filtered view)
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 }).lean();
    return res.json(events);
  } catch (err) {
    console.error('[getAllEventsAdmin]', err);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
};