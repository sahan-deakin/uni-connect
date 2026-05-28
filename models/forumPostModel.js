const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, default: 'Anonymous' },
  content: { type: String, required: true, trim: true },
}, { timestamps: true });

const forumReportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedByName: { type: String, default: 'Unknown' },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  isResolved: { type: Boolean, default: false },
}, { timestamps: true });

const forumPostSchema = new mongoose.Schema({
  postId: { type: String, unique: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, default: 'Anonymous' },
  unitCode: { type: String, default: '' },
  tags: [String],
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: [commentSchema],
  reports: [forumReportSchema],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

// Auto-generate a short readable post ID before saving
forumPostSchema.pre('save', async function () {
  if (!this.postId) {
    this.postId = 'POST-' + this._id.toString().slice(-6).toUpperCase();
  }
});

module.exports = mongoose.model('ForumPost', forumPostSchema);