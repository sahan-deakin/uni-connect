const User = require('../models/userModel');
const reviewService = require('./reviewService');

// Resolve a named duration into a concrete expiry Date (or null = permanent)
function resolveBlockUntil(duration) {
  const now = new Date();
  switch (duration) {
    case '3months':  return new Date(now.setMonth(now.getMonth() + 3));
    case '6months':  return new Date(now.setMonth(now.getMonth() + 6));
    case '1year':    return new Date(now.setFullYear(now.getFullYear() + 1));
    case 'permanent': return null;
    default: throw new Error(`Unknown duration: ${duration}`);
  }
}

// Return every user (for the All Users panel). Excludes password hash.
const getUsers = () =>
  User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

// Block a user by ID with a specified duration and reason
const blockUser = async (userId, { duration, reason, reviewId }) => {
  const blockedUntil = resolveBlockUntil(duration);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      blocked: {
        isBlocked:    true,
        blockedUntil,
        blockedAt:    new Date(),
        reason:       reason || 'Violation of review policy'
      }
    },
    { new: true }
  );

  if (!user) throw new Error('User not found');

  // Mark the associated reported review as resolved (if supplied)
  if (reviewId) await reviewService.resolveReview(reviewId);

  return user;
};

// Unblock a user manually
const unblockUser = (userId) =>
  User.findByIdAndUpdate(
    userId,
    {
      blocked: {
        isBlocked:    false,
        blockedUntil: null,
        blockedAt:    null,
        reason:       null
      }
    },
    { new: true }
  );

// Return only currently blocked users (for the Blocked Users panel)
const getBlockedUsers = () =>
  User.find({ 'blocked.isBlocked': true })
    .select('-password')
    .lean();

module.exports = { getUsers, blockUser, unblockUser, getBlockedUsers };