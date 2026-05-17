const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/feed', ctrl.getPersonalizedFeed);
router.get('/notifications', ctrl.getNotifications);
router.get('/notifications/unread-count', ctrl.getUnreadCount);
router.put('/notifications/read-all', ctrl.markAllRead);
router.put('/notifications/:id/read', ctrl.markNotificationRead);
router.get('/tracker', ctrl.getTrackerData);

module.exports = router;
