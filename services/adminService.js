const User = require('../models/userModel');
const reviewService = require('./reviewService');

// Function to resolve block duration into a date
function resolveBlockUntil(duration) {
  const now = new Date();
  switch (duration) {
    case '3months':
      return new Date(now.setMonth(now.getMonth() + 3));
    case '6months':
      return new Date(now.setMonth(now.getMonth() + 6));
    case '1year':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    case 'permanent':
      return null;
    default:
      throw new Error(`Unknown duration: ${duration}`);
  }
}

// Function to block a user by ID with specified duration and reason
const blockUser = async (userId, { duration, reason, reviewId }) => {
  const blockedUntil = resolveBlockUntil(duration);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      blocked: {
        isBlocked: true,
        blockedUntil,
        blockedAt: new Date(),
        reason: reason || 'Violation of review policy'
      }
    },
    { new: true }
  );

  if (!user) throw new Error('User not found');

  // Mark the reported review as resolved
  if (reviewId) await reviewService.resolveReview(reviewId);

  return user;
};

// Unblock a user manually
const unblockUser = (userId) =>
  User.findByIdAndUpdate(
    userId,
    {
      blocked: {
        isBlocked: false,
        blockedUntil: null,
        blockedAt: null,
        reason: null
      }
    },
    { new: true }
  );

// Get all blocked users
const getBlockedUsers = () =>
  User.find({ 'blocked.isBlocked': true }).lean();

module.exports = { blockUser, unblockUser, getBlockedUsers };