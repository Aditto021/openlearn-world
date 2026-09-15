const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true, trim: true },
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true, trim: true },
  language: { type: String, default: 'English' },
  coverEmoji: { type: String, default: '📘' },
  fileUrl: { type: String, required: true },
  pages: { type: Number, default: null },
  published: { type: Boolean, default: false, index: true }
}, { timestamps: true });

bookSchema.index({ published: 1, updatedAt: -1 });

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
