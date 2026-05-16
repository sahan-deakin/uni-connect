const Review = require('../models/reviewModel');

// Return all reported, unresolved reviews with user details populated
const getReportedReviews = () =>
  Review.find({ reportedAt: { $exists: true }, isResolved: { $ne: true } })
    .populate('user', 'username email blocked')
    .lean();

// Mark a review as resolved (after admin takes action)
const resolveReview = (reviewId) =>
  Review.findByIdAndUpdate(
    reviewId,
    { isResolved: true, resolvedAt: new Date() },
    { new: true }
  );

module.exports = { getReportedReviews, resolveReview };