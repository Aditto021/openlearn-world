const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  organization: { type: String, trim: true, maxlength: 120 },
  country: { type: String, trim: true, maxlength: 100 },
  reason: { type: String, required: true, enum: ['General', 'Schools', 'Partnerships', 'Technical', 'Feedback'] },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['new', 'reviewed', 'closed'], default: 'new', index: true }
}, { timestamps: true });

contactSubmissionSchema.index({ createdAt: -1 });

module.exports = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', contactSubmissionSchema);
