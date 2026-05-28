const mongoose = require('mongoose');
const Notification = require('../models/notificationModel');

const ALLOWED_CREATE = new Set(['studentId', 'type', 'title', 'message', 'read']);
const ALLOWED_UPDATE = new Set(['type', 'title', 'message', 'read']);
// Fields that must never be accepted from the client
const IMMUTABLE = new Set(['studentId', 'createdAt', 'updatedAt', '_id']);

function validateBody(body, allowed, context) {
  const keys = Object.keys(body);

  const immutablePresent = keys.filter(k => IMMUTABLE.has(k) && !allowed.has(k));
  if (immutablePresent.length > 0) {
    return `${immutablePresent.join(', ')} cannot be set on ${context}`;
  }

  const unknown = keys.filter(k => !allowed.has(k));
  if (unknown.length > 0) {
    return `Unknown field(s): ${unknown.join(', ')}`;
  }

  if ('type' in body && typeof body.type !== 'string') return 'type must be a string';
  if ('title' in body && typeof body.title !== 'string') return 'title must be a string';
  if ('message' in body && typeof body.message !== 'string') return 'message must be a string';
  if ('read' in body && typeof body.read !== 'boolean') return 'read must be a boolean';

  return null;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
}

const createNotification = async (req, res) => {
  try {
    const error = validateBody(req.body, ALLOWED_CREATE, 'create');
    if (error) return res.status(400).json({ error });

    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Update body cannot be empty' });
    }

    const error = validateBody(req.body, ALLOWED_UPDATE, 'update');
    if (error) return res.status(400).json({ error });

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, context: 'query' }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  updateNotification,
};
