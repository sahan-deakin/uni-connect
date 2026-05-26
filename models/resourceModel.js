const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    desc: String,

    type: {
      type: String,
      enum: ['Notes', 'Textbook', 'Video Link', 'Past Exam', 'Slides'],
      default: 'Notes'
    },

    unit: {
      type: String,
      required: true
    },

    uploader: String,

    institution: String,

    tags: [String],

    upvotes: {
      type: Number,
      default: 0
    },

    score: {
      type: Number,
      default: 0
    },

    downloadCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resource', resourceSchema);