const mongoose = require('mongoose');

// Review schema to store user reviews and reports
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewText: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  reportReason: {
    type: String,
    default: null
  },
  reportedAt: {
    type: Date,
    default: null
  },
  // Admin action
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;