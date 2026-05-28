const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/studentController');

router.use(requireAuth);

router.delete('/resources/:id',    ctrl.deleteResource);
router.delete('/forum-posts/:id',  ctrl.deleteForumPost);
router.delete('/events/:id',       ctrl.deleteOrUnregisterEvent);
router.put('/events/:id',          ctrl.updateEvent);

module.exports = router;
