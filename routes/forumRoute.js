const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/forumController');
const { requireAuth } = require('../middleware/authMiddleware');

// Student routes
router.get('/posts',                        ctrl.getPosts);
router.post('/posts',          requireAuth, ctrl.createPost);
router.post('/posts/:postId/comments', requireAuth, ctrl.addComment);
router.post('/posts/:postId/report',   requireAuth, ctrl.reportPost);

// Admin routes
router.get('/admin/posts',              ctrl.adminGetPosts);
router.get('/admin/reported',           ctrl.adminGetReported);
router.delete('/admin/posts/:postId',   ctrl.adminDeletePost);
router.put('/admin/reports/:postId/resolve', ctrl.adminResolveReport);

module.exports = router;
