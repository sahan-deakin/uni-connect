const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');

router.get('/feed', ctrl.getPersonalizedFeed);
router.get('/notifications', ctrl.getNotifications);
router.get('/notifications/unread-count', ctrl.getUnreadCount);
// static route before parameterised to avoid :id matching "read-all"
router.put('/notifications/read-all', ctrl.markAllRead);
router.put('/notifications/:id/read', ctrl.markNotificationRead);
router.get('/tracker', ctrl.getTrackerData);

module.exports = router;
