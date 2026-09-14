const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true, maxlength: 160 },
  passwordHash: { type: String, select: false },
  provider: { type: String, enum: ['email', 'google'], default: 'email' },
  googleId: { type: String, sparse: true, index: true },
  emailVerified: { type: Boolean, default: false },
  preferredLanguage: { type: String, default: 'English' }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
