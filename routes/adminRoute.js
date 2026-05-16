const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');

// router to block a user by ID
router.put('/block-user/:userId', ctrl.blockUser);

// router to unblock a user by ID
router.put('/unblock-user/:userId', ctrl.unblockUser);

// router to get list of blocked users
router.get('/blocked-users', ctrl.getBlockedUsers);

module.exports = router;