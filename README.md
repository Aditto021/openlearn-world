# OpenLearn World

OpenLearn World is an offline-aware international education platform prototype built around one promise: **Knowledge Should Have No Borders.** It provides free educational discovery, lessons, quizzes, language practice, progress tracking, accessibility controls, and an honest account of the device and connectivity barriers that software cannot solve alone.

## Stack

- React 18, TypeScript, Vite, React Router
- Tailwind CSS tooling and Lucide React icons
- Express API / Netlify Function layer with MongoDB Atlas persistence
- Local mock education data with localStorage progress
- PWA manifest, service worker, and offline fallback

## Local Development

```bash
npm install
npm run dev
```

For Vite development, run the API in a second terminal with `npm start`; Vite proxies `/api` requests to `http://localhost:3000`, preventing browser CORS and “Failed to fetch” errors.

For a production-style Express preview:

```bash
npm run build
npm start
```

The Vite build is written to `public/`, which Express serves at port `3000`.
Each build removes stale hashed frontend bundles before generating the new release assets.

## Routes

The app includes `/`, `/learn`, `/lesson/:lessonId`, `/translate`, `/offline`, `/impact`, `/about`, `/partnerships`, `/faq`, `/contact`, `/privacy`, `/terms`, `/child-safety`, `/profile`, `/settings`, `/login`, `/signup`, `/forgot-password`, and `/reset-password`.

## Architecture

```text
User -> Netlify -> React/Vite -> Secure API -> MongoDB Atlas
						 |
						 +-> Service worker + localStorage fallback
						 +-> Future secure Gemini API layer
```

MongoDB is never accessed from the browser. The API derives database access from server-side environment variables and uses bundled local content when Atlas is unavailable.

## Configuration

Copy `.env.example` to `.env`. Email authentication uses the server API, bcrypt, signed httpOnly cookies, and MongoDB `User` records. `MONGODB_URI`, `MONGODB_DB_NAME`, `SESSION_SECRET`, and Google OAuth secrets are server-only and must never use the `VITE_` prefix. Never expose service-role, OAuth private, translation, or database credentials in a client bundle.

## What Works Without External Services

- Browsing all learning content
- Search and category filtering
- Lesson progress, quizzes, scores, badges, and local profile dashboard
- Translator demo using local educational dictionaries
- Speech synthesis where the browser supports it
- Offline shell and local progress
- Accessibility preferences and theme persistence
- Contact and partnership forms with Netlify Forms declarations; local previews clearly explain that no delivery occurs

## MongoDB Atlas Setup

1. Create an Atlas project and production cluster.
2. Create a database user with the minimum permissions required for the application database.
3. Configure Network Access for the actual backend/Netlify deployment model; do not open access broadly unless Atlas security review requires it.
4. Set `MONGODB_URI` and `MONGODB_DB_NAME` in the server or Netlify Function environment, never in `VITE_` variables.
5. Start the app or call `/api/health` to verify the server reports `mongodb-atlas`.
6. Seed content explicitly when the content-management workflow is ready; application startup does not seed or duplicate records.

When Atlas is unavailable, `/api/content` returns bundled fallback content and writes only safe server-side diagnostics. Submission endpoints return a friendly `503` rather than claiming data was stored.

## Email and Google Authentication

Email signup and login use the server API, bcrypt password hashes, MongoDB `User` records, and signed httpOnly cookies. Set a strong random `SESSION_SECRET`; it is never sent to the browser. Google login uses the server-side OAuth client and is disabled with a clear setup response until `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are configured. Register the callback URL in Google Cloud and use `/api/auth/google` as the browser entry point. Password reset and verification email delivery require a mail provider and are intentionally reported as unconfigured until one is connected.

## Authentication and Future Integrations

The current account path is MongoDB-backed email authentication plus optional server-side Google OAuth. A future Gemini Learning Companion must use a secure server API; no Gemini key belongs in the frontend. The translator data can become a `translationService` backed by a real provider later. Cloud learning progress can be added to the authenticated MongoDB user boundary later; guest progress remains local.

## Netlify

Configure the build command as `npm run build` and publish directory as `public`. The SPA fallback in `netlify.toml` keeps nested routes working after refresh. Netlify Functions can run the API layer, with `MONGODB_URI` and `MONGODB_DB_NAME` configured as server environment variables. Netlify Forms declarations are also included for the contact and partnership workflows.

## Production Deployment

1. Connect this repository to Netlify.
2. Set the build command to `npm run build` and publish directory to `public`.
3. Configure a secure backend environment with `MONGODB_URI`, `MONGODB_DB_NAME`, and a generated `SESSION_SECRET`.
4. Configure Google OAuth client credentials and register `/api/auth/google/callback` for local, preview, and production URLs.
5. Deploy and verify nested route refreshes, Netlify Forms submissions, the PWA install shell, and offline fallback.
6. Configure a custom domain only after privacy, child-safety, accessibility, content, and contact workflows have been reviewed.

## Before Going Public

Legal review is required before public launch. Review privacy, terms, child safety, advertising policy, data retention, authentication consent, and jurisdiction-specific requirements. Configure a real contact destination in Netlify Forms, complete Atlas and Google OAuth production setup, rotate all credentials, and perform final mobile/offline QA.

## Accessibility and Privacy

The app includes keyboard-friendly controls, semantic forms, focusable navigation, reduced motion, larger text, high contrast, offline indicators, and child-safety messaging. No account is required to learn and no behavioral analytics or targeted advertising is enabled by this prototype. Legal review is required before public launch.
