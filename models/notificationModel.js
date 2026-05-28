const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: {
    type: String,
    enum: { values: ['message', 'forum_reply', 'event', 'resource'], message: '{VALUE} is not a valid notification type' },
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    validate: {
      validator: v => v.trim().length > 0,
      message: 'Title cannot be blank'
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [1, 'Message cannot be empty'],
    maxlength: [500, 'Message cannot exceed 500 characters'],
    validate: {
      validator: v => v.trim().length > 0,
      message: 'Message cannot be blank'
    }
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
