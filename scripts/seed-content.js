require('dotenv').config();
const mongoose = require('mongoose');
const fallback = require('../data/content-fallback.json');
const Content = require('../models/Content');

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to seed Atlas content.');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || undefined });
  for (const lesson of fallback.lessons) {
    await Content.updateOne({ slug: lesson.slug }, { $setOnInsert: { ...lesson, content: [lesson.description], keyConcepts: [] } }, { upsert: true });
  }
  process.stdout.write(`Seeded ${fallback.lessons.length} fallback lessons without duplicating existing records.\n`);
  await mongoose.disconnect();
}

seed().catch((error) => { process.stderr.write(`Seed failed: ${error.message}\n`); process.exitCode = 1; });
