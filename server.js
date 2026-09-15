require('dotenv').config();
const path = require('path');
const fs = require('fs');
const dns = require('dns');
// Node's default resolver fails SRV lookups on some ISPs/networks even though
// the OS resolver works fine. Point Node at public DNS so mongodb+srv:// URIs resolve.
dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const fallbackContent = require('./data/content-fallback.json');
const fallbackBooks = require('./data/books-fallback.json');
const Content = require('./models/Content');
const ContactSubmission = require('./models/ContactSubmission');
const PartnershipRequest = require('./models/PartnershipRequest');
const User = require('./models/User');
const Book = require('./models/Book');
const AcademyProgress = require('./models/AcademyProgress');
const localUsersPath = path.join(__dirname, 'data', 'users-local.json');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
let databasePromise;
let databaseRetryAfter = 0;

function connectDatabase() {
  if (!process.env.MONGODB_URI) return Promise.resolve(false);
  if (mongoose.connection.readyState === 1) return Promise.resolve(true);
  
  if (!databasePromise) {
    databasePromise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || undefined,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Force IPv4 to resolve ISP DNS/routing issues
      maxPoolSize: 10
    }).then(() => {
      console.log('Successfully connected to MongoDB Atlas!');
      return true;
    }).catch((error) => {
      databasePromise = undefined;
      process.stderr.write(`MongoDB connection unavailable: ${error.message}\n`);
      return false;
    });
  }
  return databasePromise;
}

const cleanText = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const submissionPayload = (body, kind) => {
  const payload = {
    name: cleanText(body.name, 100),
    email: cleanText(body.email, 160).toLowerCase(),
    message: cleanText(body.message, 2000)
  };
  if (kind === 'contact') Object.assign(payload, { organization: cleanText(body.organization, 120), country: cleanText(body.country, 100), reason: cleanText(body.reason, 80) });
  if (kind === 'partnership') Object.assign(payload, { organization: cleanText(body.organization, 120), organizationType: cleanText(body.organizationType, 80), country: cleanText(body.country, 100), interest: cleanText(body.interest, 500) });
  return payload;
};

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const authAttempts = new Map();
const authRateLimit = (req, res, next) => {
  const key = req.ip || 'unknown'; const now = Date.now(); const current = authAttempts.get(key);
  if (!current || now > current.resetAt) { authAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 }); return next(); }
  if (current.count >= 20) return res.status(429).json({ error: 'too_many_attempts', message: 'Too many account attempts. Please wait a few minutes and try again.' });
  current.count += 1; return next();
};

const sessionSecret = () => process.env.SESSION_SECRET && process.env.SESSION_SECRET !== 'replace-with-a-long-random-production-secret' ? process.env.SESSION_SECRET : null;
const issueSession = (res, user) => {
  const secret = sessionSecret();
  if (!secret) return false;
  const token = jwt.sign({ sub: String(user._id), email: user.email }, secret, { expiresIn: '7d' });
  res.cookie('openlearn_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
  return true;
};
const currentUser = async (req) => {
  const secret = sessionSecret();
  if (!secret || !req.cookies.openlearn_session) return null;
  try {
    const payload = jwt.verify(req.cookies.openlearn_session, secret);
    if (payload.store === 'local' && localAuthEnabled()) return readLocalUsers().find((user) => user._id === payload.sub) || null;
    return User.findById(payload.sub).select('-passwordHash').lean();
  } catch { return null; }
};
const authResponse = (user) => ({ id: user._id, name: user.name, email: user.email, provider: user.provider, emailVerified: user.emailVerified, preferredLanguage: user.preferredLanguage });
const localAuthEnabled = () => process.env.NODE_ENV !== 'production';
const readLocalUsers = () => JSON.parse(fs.readFileSync(localUsersPath, 'utf8'));
const writeLocalUsers = (users) => fs.writeFileSync(localUsersPath, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
const localUserResponse = (user) => ({ id: user._id, name: user.name, email: user.email, provider: user.provider, emailVerified: user.emailVerified, preferredLanguage: user.preferredLanguage });

app.post('/api/auth/signup', authRateLimit, async (req, res) => {
  const name = cleanText(req.body.name, 100); const email = cleanText(req.body.email, 160).toLowerCase(); const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (name.length < 2 || !validEmail(email) || password.length < 8) return res.status(400).json({ error: 'invalid_signup', message: 'Use a name, valid email, and password of at least 8 characters.' });
  if (!sessionSecret()) return res.status(503).json({ error: 'auth_unconfigured', message: 'Secure account sessions are not configured on this server.' });
  try {
    const connected = await connectDatabase();
    if (!connected && localAuthEnabled()) {
      const users = readLocalUsers();
      if (users.some((user) => user.email === email)) return res.status(409).json({ error: 'email_exists', message: 'An account with this email already exists.' });
      const user = { _id: `local-${Date.now()}`, name, email, passwordHash: await bcrypt.hash(password, 12), provider: 'email', emailVerified: false, preferredLanguage: 'English' };
      users.push(user); writeLocalUsers(users); const token = jwt.sign({ sub: user._id, email: user.email, store: 'local' }, sessionSecret(), { expiresIn: '7d' });
      res.cookie('openlearn_session', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
      return res.status(201).json({ user: localUserResponse(user), message: 'Account created locally for development.' });
    }
    if (!connected) return res.status(503).json({ error: 'database_unavailable', message: 'Account storage is temporarily unavailable. Please try again later.' });
    const existing = await User.findOne({ email }); if (existing) return res.status(409).json({ error: 'email_exists', message: 'An account with this email already exists.' }); const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), provider: 'email', emailVerified: false }); issueSession(res, user); return res.status(201).json({ user: authResponse(user), message: 'Account created. Email verification can be enabled with a mail provider.' });
  } catch (error) { process.stderr.write(`Signup failed: ${error.message}\n`); return res.status(500).json({ error: 'signup_failed', message: 'We could not create your account. Please try again.' }); }
});

app.post('/api/auth/login', authRateLimit, async (req, res) => {
  const email = cleanText(req.body.email, 160).toLowerCase(); const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!validEmail(email) || !password) return res.status(400).json({ error: 'invalid_login', message: 'Enter a valid email and password.' });
  if (!sessionSecret()) return res.status(503).json({ error: 'auth_unconfigured', message: 'Secure account sessions are not configured on this server.' });
  try {
    const connected = mongoose.connection.readyState === 1 || (process.env.NODE_ENV === 'production' ? await connectDatabase() : false);
    if (!connected && localAuthEnabled()) {
      const user = readLocalUsers().find((candidate) => candidate.email === email); const valid = user && await bcrypt.compare(password, user.passwordHash); if (!valid) return res.status(401).json({ error: 'invalid_credentials', message: 'Email or password is incorrect.' }); const token = jwt.sign({ sub: user._id, email: user.email, store: 'local' }, sessionSecret(), { expiresIn: '7d' }); res.cookie('openlearn_session', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' }); return res.json({ user: localUserResponse(user), development: true });
    }
    if (!connected) return res.status(503).json({ error: 'database_unavailable', message: 'Account storage is temporarily unavailable. Please try again later.' });
    const user = await User.findOne({ email }).select('+passwordHash'); const valid = user && user.passwordHash && await bcrypt.compare(password, user.passwordHash); if (!valid) return res.status(401).json({ error: 'invalid_credentials', message: 'Email or password is incorrect.' }); issueSession(res, user); return res.json({ user: authResponse(user) });
  } catch (error) { process.stderr.write(`Login failed: ${error.message}\n`); return res.status(500).json({ error: 'login_failed', message: 'We could not sign you in. Please try again.' }); }
});

app.get('/api/auth/me', async (req, res) => { const user = await currentUser(req); return res.json({ user: user ? authResponse(user) : null }); });
app.post('/api/auth/logout', (_req, res) => { res.clearCookie('openlearn_session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' }); res.json({ ok: true }); });
app.get('/api/auth/google', (_req, res) => { if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.redirect('/login?auth=google_unconfigured'); const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL); const url = client.generateAuthUrl({ access_type: 'offline', scope: ['openid', 'email', 'profile'], prompt: 'select_account' }); res.redirect(url); });
app.get('/api/auth/google/callback', async (req, res) => { if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !sessionSecret()) return res.redirect('/login?auth=unconfigured'); try { const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL); const { tokens } = await client.getToken(req.query.code); const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID }); const profile = ticket.getPayload(); if (!profile?.email) return res.redirect('/login?auth=failed'); let user = await User.findOne({ email: profile.email.toLowerCase() }); if (!user) user = await User.create({ name: profile.name || profile.email.split('@')[0], email: profile.email.toLowerCase(), provider: 'google', googleId: profile.sub, emailVerified: Boolean(profile.email_verified) }); issueSession(res, user); return res.redirect('/profile'); } catch (error) { process.stderr.write(`Google auth failed: ${error.message}\n`); return res.redirect('/login?auth=failed'); } });

app.get('/api/health', async (_req, res) => {
  const connected = await connectDatabase();
  res.json({ ok: true, database: connected ? 'mongodb-atlas' : 'fallback-local', content: connected ? 'database-primary' : 'bundled-local' });
});

app.get('/api/content', async (req, res) => {
  const connected = await connectDatabase();
  if (!connected) return res.json({ source: 'local', ...fallbackContent });
  try {
    const query = { published: true };
    if (req.query.category) query.category = cleanText(req.query.category, 60);
    const lessons = await Content.find(query).sort({ updatedAt: -1 }).lean();
    return res.json({ source: 'mongodb-atlas', lessons: lessons.length ? lessons : fallbackContent.lessons });
  } catch (error) {
    process.stderr.write(`Content query failed: ${error.message}\n`);
    return res.status(503).json({ error: 'content_unavailable', message: "We couldn't load live content right now. The offline library remains available." });
  }
});

app.get('/api/books', async (req, res) => {
  const connected = await connectDatabase();
  if (!connected) return res.json({ source: 'local', books: fallbackBooks.books });
  try {
    const query = { published: true };
    if (req.query.category) query.category = cleanText(req.query.category, 60);
    const books = await Book.find(query).sort({ updatedAt: -1 }).lean();
    return res.json({ source: 'mongodb-atlas', books: books.length ? books : fallbackBooks.books });
  } catch (error) {
    process.stderr.write(`Books query failed: ${error.message}\n`);
    return res.status(503).json({ error: 'books_unavailable', message: "We couldn't load the book library right now." });
  }
});

app.get('/api/academy/progress', async (req, res) => {
  const user = await currentUser(req);
  if (!user) return res.json({ progress: null });
  const connected = await connectDatabase();
  if (!connected) return res.json({ progress: null });
  try {
    const progress = await AcademyProgress.findOne({ user: user._id }).lean();
    return res.json({ progress: progress ? { mode: progress.mode, lesson: progress.lesson, code: progress.code, language: progress.language } : null });
  } catch (error) {
    process.stderr.write(`Academy progress fetch failed: ${error.message}\n`);
    return res.status(503).json({ error: 'progress_unavailable', message: 'We could not load your saved progress right now.' });
  }
});

app.post('/api/academy/progress', async (req, res) => {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: 'sign_in_required', message: 'Sign in to sync your Academy progress across devices.' });
  const mode = req.body.mode === 'html' ? 'html' : 'p5';
  const lesson = Number.isInteger(req.body.lesson) && req.body.lesson >= 0 ? req.body.lesson : 0;
  const code = cleanText(req.body.code, 20000);
  const language = cleanText(req.body.language, 10) || 'en-US';
  if (!(await connectDatabase())) return res.status(503).json({ error: 'service_unavailable', message: 'Progress sync is temporarily unavailable. Your work is still saved on this device.' });
  try {
    await AcademyProgress.updateOne({ user: user._id }, { $set: { mode, lesson, code, language } }, { upsert: true });
    return res.json({ ok: true });
  } catch (error) {
    process.stderr.write(`Academy progress save failed: ${error.message}\n`);
    return res.status(500).json({ error: 'save_failed', message: 'We could not sync your progress. Your work is still saved on this device.' });
  }
});

const mentorAttempts = new Map();
const mentorRateLimit = (req, res, next) => {
  const key = req.ip || 'unknown'; const now = Date.now(); const current = mentorAttempts.get(key);
  if (!current || now > current.resetAt) { mentorAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 }); return next(); }
  if (current.count >= 40) return res.status(429).json({ error: 'too_many_attempts', message: 'The AI mentor is getting a lot of questions from you. Please wait a few minutes.' });
  current.count += 1; return next();
};

const GEMINI_MODEL = 'gemini-3.6-flash';
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 320, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } }
    })
  });
  if (!response.ok) throw new Error(`Gemini API responded with ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || null;
}

app.post('/api/academy/mentor', mentorRateLimit, async (req, res) => {
  const message = cleanText(req.body.message, 600);
  const code = cleanText(req.body.code, 6000);
  const mode = req.body.mode === 'html' ? 'html' : 'p5';
  const lang = cleanText(req.body.lang, 10) || 'en-US';
  if (!message) return res.status(400).json({ error: 'invalid_request', message: 'A question or message is required.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'ai_unconfigured', message: 'The AI mentor is not configured on this server yet.' });
  try {
    const prompt = `You are a friendly, encouraging coding mentor for InclusiveCode Academy, a free global learning platform for beginners. The student is learning ${mode === 'p5' ? 'creative coding with Processing/p5.js' : 'web development with HTML, CSS, and JavaScript'}. Reply in the language of this locale code (use the matching human language, not the code itself): ${lang}. Keep your reply short (2-4 sentences), warm, simple, and encouraging, suitable for a child or beginner learner. Reference their current code when it helps.\n\nStudent's current code:\n\`\`\`\n${code || '(no code yet)'}\n\`\`\`\n\nStudent says: "${message}"`;
    const reply = await callGemini(prompt);
    if (!reply) return res.status(502).json({ error: 'ai_failed', message: 'The AI mentor could not respond right now.' });
    return res.json({ reply });
  } catch (error) {
    process.stderr.write(`Gemini mentor failed: ${error.message}\n`);
    return res.status(502).json({ error: 'ai_failed', message: 'The AI mentor could not respond right now. Please try again.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const payload = submissionPayload(req.body, 'contact');
  if (!payload.name || !validEmail(payload.email) || !payload.reason || !payload.message) return res.status(400).json({ error: 'invalid_submission', message: 'Please complete the required contact fields.' });
  if (!(await connectDatabase())) return res.status(503).json({ error: 'service_unavailable', message: 'Contact storage is not configured on this server yet.' });
  try { await ContactSubmission.create(payload); return res.status(201).json({ accepted: true, message: 'Your inquiry was received for review.' }); } catch (error) { process.stderr.write(`Contact submission failed: ${error.message}\n`); return res.status(500).json({ error: 'submission_failed', message: 'We could not save your inquiry. Please try again later.' }); }
});

app.post('/api/partnerships', async (req, res) => {
  const payload = submissionPayload(req.body, 'partnership');
  if (!payload.name || !payload.organization || !validEmail(payload.email) || !payload.organizationType || !payload.country || !payload.interest || !payload.message) return res.status(400).json({ error: 'invalid_submission', message: 'Please complete the required partnership fields.' });
  if (!(await connectDatabase())) return res.status(503).json({ error: 'service_unavailable', message: 'Partnership storage is not configured on this server yet.' });
  try { await PartnershipRequest.create(payload); return res.status(201).json({ accepted: true, message: 'Your partnership inquiry was received for review.' }); } catch (error) { process.stderr.write(`Partnership submission failed: ${error.message}\n`); return res.status(500).json({ error: 'submission_failed', message: 'We could not save your inquiry. Please try again later.' }); }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  connectDatabase();
  app.listen(PORT, () => process.stdout.write(`OpenLearn World running at http://localhost:${PORT}\n`));
}

module.exports = app;
module.exports.connectDatabase = connectDatabase;
