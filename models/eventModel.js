const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['academic', 'networking', 'workshop', 'competition', 'career', 'study', 'social']
  },
  organizer: String,
  date:      { type: Date, required: true },
  location:  String,
  isOnline:  { type: Boolean, default: false },

  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  tags:      [String],
  unitCodes: [String],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },

  // Admin moderation fields
  status: {
    type:    String,
    enum:    ['pending', 'approved', 'rejected'],
    default: 'pending',
    index:   true          // queried frequently by admin dashboard
  },
  rejectionReason: { type: String, default: null },
  reviewedAt:      { type: Date,   default: null },
  reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);