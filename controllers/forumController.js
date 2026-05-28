const ForumPost = require('../models/forumPostModel');
const socketService = require('../services/socketService');

//  GET /api/forum/posts  — all non-deleted posts (newest first)
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await ForumPost.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) { next(err); }
};

//  POST /api/forum/posts — create a new post
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, unitCode, tags, authorName } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

    // Use authenticated user id if auth middleware ran, else allow guest name
    const authorId = req.user?.userId || req.body.authorId;
    if (!authorId) return res.status(401).json({ error: 'Not authenticated' });

    const post = await ForumPost.create({
      title: title.trim(),
      content: content.trim(),
      author: authorId,
      authorName: authorName || req.user?.username || 'Student',
      unitCode: unitCode || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    // Notify everyone on the forum page about the new post in real time
    socketService.notifyForum('forum:new-post', {
      _id:        post._id,
      title:      post.title,
      authorName: post.authorName,
      authorId:   authorId,        // used by client to skip own posts
      unitCode:   post.unitCode,
      createdAt:  post.createdAt
    });

    res.status(201).json(post);
  } catch (err) { next(err); }
};

//  POST /api/forum/posts/:postId/comments — add a comment
exports.addComment = async (req, res, next) => {
  try {
    const { content, authorName } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const authorId = req.user?.userId || req.body.authorId;
    if (!authorId) return res.status(401).json({ error: 'Not authenticated' });

    const post = await ForumPost.findOne({ _id: req.params.postId, isDeleted: false });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({
      author: authorId,
      authorName: authorName || req.user?.username || 'Student',
      content: content.trim(),
    });
    await post.save();
    res.json(post);
  } catch (err) { next(err); }
};

//  POST /api/forum/posts/:postId/report — report a post
exports.reportPost = async (req, res, next) => {
  try {
    const { reason, details, reportedByName } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });

    const reportedById = req.user?.userId || req.body.reportedById;
    if (!reportedById) return res.status(401).json({ error: 'Not authenticated' });

    const post = await ForumPost.findOne({ _id: req.params.postId, isDeleted: false });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Prevent duplicate reports from the same user
    const alreadyReported = post.reports.some(r => r.reportedBy.toString() === reportedById.toString());
    if (alreadyReported) return res.status(409).json({ error: 'You have already reported this post' });

    post.reports.push({
      reportedBy: reportedById,
      reportedByName: reportedByName || req.user?.username || 'Unknown',
      reason,
      details: details || '',
    });
    await post.save();
    res.json({ message: 'Report submitted', postId: post.postId });
  } catch (err) { next(err); }
};

//  GET /api/forum/admin/posts — ALL posts including deleted (admin only)
exports.adminGetPosts = async (req, res, next) => {
  try {
    const posts = await ForumPost.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) { next(err); }
};

//  GET /api/forum/admin/reported — posts with at least one unresolved report
exports.adminGetReported = async (req, res, next) => {
  try {
    const posts = await ForumPost.find({
      isDeleted: false,
      'reports.0': { $exists: true },
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) { next(err); }
};

// ── DELETE /api/forum/admin/posts/:postId — soft-delete a post
exports.adminDeletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.postId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted', postId: post.postId });
  } catch (err) { next(err); }
};

//  PUT /api/forum/admin/reports/:postId/resolve — mark all reports on a post resolved
exports.adminResolveReport = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.reports.forEach(r => { r.isResolved = true; r.resolvedAt = new Date(); });
    await post.save();
    res.json({ message: 'Reports resolved', postId: post.postId });
  } catch (err) { next(err); }
};