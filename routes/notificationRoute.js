const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.post('/',               ctrl.createNotification);
router.get('/',                ctrl.getNotifications);
router.get('/unread-count',    ctrl.getUnreadCount);
router.patch('/mark-all-read', ctrl.markAllRead);
router.patch('/:id/read',      ctrl.markNotificationRead);
router.put('/:id',             ctrl.updateNotification);

module.exports = router;
