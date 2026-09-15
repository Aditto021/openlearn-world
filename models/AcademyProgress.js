const mongoose = require('mongoose');

const academyProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  mode: { type: String, enum: ['p5', 'html'], default: 'p5' },
  lesson: { type: Number, default: 0, min: 0 },
  code: { type: String, default: '', maxlength: 20000 },
  language: { type: String, default: 'en-US' }
}, { timestamps: true });

module.exports = mongoose.models.AcademyProgress || mongoose.model('AcademyProgress', academyProgressSchema);
