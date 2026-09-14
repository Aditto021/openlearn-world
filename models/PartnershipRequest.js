const mongoose = require('mongoose');

const partnershipRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  organization: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  organizationType: { type: String, required: true, trim: true, maxlength: 80 },
  country: { type: String, required: true, trim: true, maxlength: 100 },
  interest: { type: String, required: true, trim: true, maxlength: 500 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['new', 'reviewed', 'closed'], default: 'new', index: true }
}, { timestamps: true });

partnershipRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.models.PartnershipRequest || mongoose.model('PartnershipRequest', partnershipRequestSchema);
