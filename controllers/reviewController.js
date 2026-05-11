const reviewService = require('../services/reviewService');

// Control function for fetching all reported reviews
exports.getReportedReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReportedReviews();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};