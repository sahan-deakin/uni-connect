const mongoose = require('mongoose');

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
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);