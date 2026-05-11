const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  university: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, default: 1 },
  unitCodes: [String],
  skills: [String],
  interests: [String],
  bio: String
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
