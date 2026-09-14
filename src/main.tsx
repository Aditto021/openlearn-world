import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './app.css';
import './production-overrides.css';
import './theme-fixes.css';

const browserFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
	const controller = new AbortController();
	const timer = window.setTimeout(() => controller.abort(), 10000);
	return browserFetch(input, { ...init, signal: controller.signal }).finally(() => window.clearTimeout(timer));
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>);
