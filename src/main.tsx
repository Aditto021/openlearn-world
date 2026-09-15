import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { initSiteLanguage } from './i18n';
import './app.css';
import './production-overrides.css';
import './theme-fixes.css';

const browserFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
	const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
	// AI-backed endpoints (translation, mentor) can be slower on a cold serverless start; give them more room.
	const timeoutMs = url.includes('/api/translate') || url.includes('/api/academy/mentor') ? 25000 : 10000;
	const controller = new AbortController();
	const timer = window.setTimeout(() => controller.abort(), timeoutMs);
	return browserFetch(input, { ...init, signal: controller.signal }).finally(() => window.clearTimeout(timer));
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>);
initSiteLanguage();
