const adminService = require('../services/adminService');

// GET /api/admin/users
// Returns all users for the All Users panel (no passwords)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/block-user/:userId
// Body: { duration, reason?, reviewId? }
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

// PUT /api/admin/unblock-user/:userId
exports.unblockUser = async (req, res, next) => {
  try {
    const user = await adminService.unblockUser(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User unblocked successfully', user });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/blocked-users
exports.getBlockedUsers = async (req, res, next) => {
  try {
    const users = await adminService.getBlockedUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};