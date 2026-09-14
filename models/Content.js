const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: Number, required: true, min: 0 }
}, { _id: false });

const contentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true, trim: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Starter', 'Growing', 'Challenge'], default: 'Starter' },
  duration: { type: Number, required: true, min: 1 },
  content: { type: [String], default: [] },
  keyConcepts: { type: [String], default: [] },
  quiz: { type: quizSchema, required: false },
  relatedLessons: { type: [String], default: [] },
  language: { type: String, default: 'English', index: true },
  published: { type: Boolean, default: false, index: true }
}, { timestamps: true });

contentSchema.index({ category: 1, published: 1, updatedAt: -1 });

module.exports = mongoose.models.Content || mongoose.model('Content', contentSchema);
