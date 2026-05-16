const Event = require('../models/eventModel');

/**
 * Get all events for admin (any status), newest first.
 */
const getAllEvents = () =>
  Event.find({})
    .sort({ createdAt: -1 })
    .lean();

/**
 * Get only pending events (used by dashboard summary).
 */
const getPendingEvents = () =>
  Event.find({ status: 'pending' })
    .sort({ date: 1 })
    .lean();

/**
 * Get a single event by ID.
 */
const getEventById = (eventId) =>
  Event.findById(eventId).lean();

/**
 * Create a new event (submitted by organiser, starts as pending).
 */
const createEvent = (data) =>
  Event.create({ ...data, status: 'pending' });

/**
 * Approve an event.
 */
const approveEvent = (eventId, adminId = null) =>
  Event.findByIdAndUpdate(
    eventId,
    {
      status: 'approved',
      rejectionReason: null,
      reviewedAt: new Date(),
      reviewedBy: adminId
    },
    { new: true }
  );

/**
 * Reject an event with an optional reason.
 */
const rejectEvent = (eventId, reason = null, adminId = null) =>
  Event.findByIdAndUpdate(
    eventId,
    {
      status: 'rejected',
      rejectionReason: reason || null,
      reviewedAt: new Date(),
      reviewedBy: adminId
    },
    { new: true }
  );

/**
 * Reset an event back to pending (undo approve/reject).
 */
const resetEvent = (eventId) =>
  Event.findByIdAndUpdate(
    eventId,
    {
      status: 'pending',
      rejectionReason: null,
      reviewedAt: null,
      reviewedBy: null
    },
    { new: true }
  );

/**
 * Update event details.
 */
const updateEvent = (eventId, data) =>
  Event.findByIdAndUpdate(eventId, data, { new: true, runValidators: true });

/**
 * Delete an event.
 */
const deleteEvent = (eventId) =>
  Event.findByIdAndDelete(eventId);

/**
 * Register a student for an event.
 */
const registerStudent = (eventId, studentId) =>
  Event.findByIdAndUpdate(
    eventId,
    { $addToSet: { registeredStudents: studentId } },
    { new: true }
  );

/**
 * Unregister a student from an event.
 */
const unregisterStudent = (eventId, studentId) =>
  Event.findByIdAndUpdate(
    eventId,
    { $pull: { registeredStudents: studentId } },
    { new: true }
  );

module.exports = {
  getAllEvents,
  getPendingEvents,
  getEventById,
  createEvent,
  approveEvent,
  rejectEvent,
  resetEvent,
  updateEvent,
  deleteEvent,
  registerStudent,
  unregisterStudent
};
