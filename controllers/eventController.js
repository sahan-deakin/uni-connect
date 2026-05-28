const eventService = require('../services/eventService');

// POST /api/events/:id/register — add student to registeredStudents
exports.registerForEvent = async (req, res) => {
  try {
    const { studentId } = req.user;
    if (!studentId) return res.status(403).json({ error: 'Student profile not found' });

    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const updated = await eventService.registerStudent(req.params.id, studentId);
    return res.json({ message: 'Registered successfully', registeredCount: updated.registeredStudents.length });
  } catch (err) {
    console.error('[registerForEvent]', err);
    return res.status(500).json({ error: 'Failed to register' });
  }
};

// DELETE /api/events/:id/register — remove student from registeredStudents
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { studentId } = req.user;
    if (!studentId) return res.status(403).json({ error: 'Student profile not found' });

    const updated = await eventService.unregisterStudent(req.params.id, studentId);
    if (!updated) return res.status(404).json({ error: 'Event not found' });

    return res.json({ message: 'Unregistered successfully', registeredCount: updated.registeredStudents.length });
  } catch (err) {
    console.error('[unregisterFromEvent]', err);
    return res.status(500).json({ error: 'Failed to unregister' });
  }
};

// POST /api/events — student submits a new event (starts as pending)
exports.createStudentEvent = async (req, res) => {
  try {
    const { studentId } = req.user || {};
    const { title, description, type, organizer, date, location, isOnline, tags, unitCodes } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const event = await eventService.createEvent({
      title, description, type, organizer,
      date, location,
      isOnline: !!isOnline,
      tags: tags || [],
      unitCodes: unitCodes || [],
      createdBy: studentId || null
    });

    return res.status(201).json({ message: 'Event submitted for review', event });
  } catch (err) {
    console.error('[createStudentEvent]', err);
    return res.status(500).json({ error: 'Failed to create event' });
  }
};

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