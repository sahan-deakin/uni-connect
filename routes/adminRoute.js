const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');

// GET  /api/admin/users              — all users (All Users panel)
router.get('/users', ctrl.getUsers);

// PUT  /api/admin/block-user/:userId  — block a user
router.put('/block-user/:userId', ctrl.blockUser);

// PUT  /api/admin/unblock-user/:userId — unblock a user
router.put('/unblock-user/:userId', ctrl.unblockUser);

// GET  /api/admin/blocked-users       — list blocked users
router.get('/blocked-users', ctrl.getBlockedUsers);

module.exports = router;