const mongoose = require('mongoose');

// User schema to store user profiles and block status
// Subjected to remove incase alternative profile management is implemented - NEED TO DISCUSS WITH THE TEAM
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  blocked: {
    isBlocked: { type: Boolean, default: false },
    blockedUntil: { type: Date, default: null }, // null = permanent
    blockedAt: { type: Date, default: null },
    reason: { type: String, default: null }
  }
}, { timestamps: true });

// Helper: is the user currently blocked?
userSchema.virtual('isCurrentlyBlocked').get(function () {
  if (!this.blocked.isBlocked) return false;
  if (!this.blocked.blockedUntil) return true; // permanent
  return this.blocked.blockedUntil > new Date();
});

const User = mongoose.model('User', userSchema);
module.exports = User;