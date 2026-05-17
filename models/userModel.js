const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  blocked: {
    isBlocked: { type: Boolean, default: false },
    blockedUntil: { type: Date, default: null },
    blockedAt: { type: Date, default: null },
    reason: { type: String, default: null }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.virtual('isCurrentlyBlocked').get(function () {
  if (!this.blocked.isBlocked) return false;
  if (!this.blocked.blockedUntil) return true;
  return this.blocked.blockedUntil > new Date();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
