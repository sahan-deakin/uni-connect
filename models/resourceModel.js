const mongoose = require('mongoose');



const resourceReportSchema = new mongoose.Schema({
  reportedAt: { type: Date, default: Date.now },
  reason:     { type: String, required: true, trim: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null }
}, { _id: false });


const resourceSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  desc: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: [
      'Notes',
      'Textbook',
      'Video Link',
      'Past Exam',
      'Slides'
    ],
    default: 'Notes'
  },

  unit: {
    type: String,
    required: true
  },

  institution: {
    type: String,
    required: true
  },

  uploader: {
    type: String,
    default: 'Anonymous Student'
  },

  fileUrl: {
  type: String
  },

  originalFileName: {
    type: String
  },

  tags: {
    type: [String],
    default: []
  },

  upvotes: {
    type: Number,
    default: 0
  },

  score: {
    type: Number,
    default: 70
  },

  downloadCount: {
    type: Number,
    default: 0
  },

  //  Resource report 
  report: { type: resourceReportSchema, default: null }

}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
