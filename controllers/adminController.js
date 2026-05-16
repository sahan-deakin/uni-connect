const adminService = require('../services/adminService');

// Control function for blocking a user
exports.blockUser = async (req, res, next) => {
  try {
    const { duration, reason, reviewId } = req.body;
    if (!duration) return res.status(400).json({ error: 'duration is required' });

    const user = await adminService.blockUser(req.params.userId, { duration, reason, reviewId });
    res.json({ message: 'User blocked successfully', user });
  } catch (err) {
    next(err);
  }
};

// Control function for unblocking a user
exports.unblockUser = async (req, res, next) => {
  try {
    const user = await adminService.unblockUser(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User unblocked successfully', user });
  } catch (err) {
    next(err);
  }
};

// Control function for fetching all blocked users
exports.getBlockedUsers = async (req, res, next) => {
  try {
    const users = await adminService.getBlockedUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};