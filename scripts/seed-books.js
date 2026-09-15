require('dotenv').config();
const mongoose = require('mongoose');
const fallback = require('../data/books-fallback.json');
const Book = require('../models/Book');

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to seed Atlas books.');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || undefined });
  for (const book of fallback.books) {
    await Book.updateOne({ slug: book.slug }, { $setOnInsert: book }, { upsert: true });
  }
  process.stdout.write(`Seeded ${fallback.books.length} fallback books without duplicating existing records.\n`);
  await mongoose.disconnect();
}

seed().catch((error) => { process.stderr.write(`Seed failed: ${error.message}\n`); process.exitCode = 1; });
