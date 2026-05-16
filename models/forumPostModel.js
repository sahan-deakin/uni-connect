const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  unitCode: String,
  tags: [String],
  replies: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
