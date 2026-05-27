const mongoose = require('mongoose');

const resourceReportSchema = new mongoose.Schema({
  reportedAt: { type: Date, default: Date.now },
  reason:     { type: String, required: true, trim: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null }
}, { _id: false });

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['notes', 'textbook', 'video', 'past-exam', 'guide'], default: 'notes' },
  unitCode: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tags: [String],
  downloadCount: { type: Number, default: 0 },

  //  Resource report 
  report: { type: resourceReportSchema, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
