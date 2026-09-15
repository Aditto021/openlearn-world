// Live, whole-site translation: walks the rendered DOM and swaps text nodes for
// AI-translated versions, similar in spirit to the Google Translate website widget,
// but powered by our own /api/translate endpoint (Gemini) so it stays reliable and
// under our control. English is always the original, unmodified language.

const STORAGE_KEY = 'olw-site-lang';
const CACHE_PREFIX = 'olw-i18n-cache:';
const RTL_LANGS = new Set(['ar', 'ur']);

export const siteLanguages: [string, string][] = [
  ['en', 'English'],
  ['bn', 'বাংলা (Bangla)'],
  ['es', 'Español (Spanish)'],
  ['hi', 'हिन्दी (Hindi)'],
  ['ar', 'العربية (Arabic)'],
  ['fr', 'Français (French)'],
  ['de', 'Deutsch (German)'],
  ['zh', '中文 (Chinese)'],
  ['ja', '日本語 (Japanese)'],
  ['pt', 'Português (Portuguese)'],
  ['ru', 'Русский (Russian)'],
  ['ur', 'اردو (Urdu)']
];

const languageNames: Record<string, string> = Object.fromEntries(siteLanguages);

const originalByNode = new Map<Text, string>();
const appliedByNode = new Map<Text, string>();
let observer: MutationObserver | null = null;
let flushTimer: number | null = null;
let currentLang = 'en';

function isTranslatable(node: Text): boolean {
  const text = node.nodeValue || '';
  if (!text.trim() || !/[a-zA-Z]/.test(text)) return false;
  const parent = node.parentElement;
  if (!parent) return false;
  if (['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE'].includes(parent.tagName)) return false;
  if (parent.closest('[data-no-translate]')) return false;
  return true;
}

function needsTranslation(node: Text): boolean {
  const applied = appliedByNode.get(node);
  if (applied === undefined) return true;
  return node.nodeValue !== applied;
}

function collectTextNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current: Node | null = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    if (isTranslatable(textNode) && needsTranslation(textNode)) nodes.push(textNode);
    current = walker.nextNode();
  }
  return nodes;
}

function hash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return `${h}:${text.length}`;
}

function getCached(lang: string, text: string): string | null {
  try { return localStorage.getItem(`${CACHE_PREFIX}${lang}:${hash(text)}`); } catch { return null; }
}

function setCached(lang: string, text: string, translated: string) {
  try { localStorage.setItem(`${CACHE_PREFIX}${lang}:${hash(text)}`, translated); } catch { /* storage unavailable or full */ }
}

async function translateBatch(texts: string[], lang: string): Promise<string[]> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target: languageNames[lang] || lang })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || !Array.isArray(data.translations) || data.translations.length !== texts.length) return texts;
    return data.translations;
  } catch {
    return texts;
  }
}

function applyTranslation(node: Text, original: string, translated: string, lang: string) {
  if (!node.isConnected) return;
  originalByNode.set(node, original);
  node.nodeValue = translated;
  appliedByNode.set(node, translated);
  setCached(lang, original, translated);
}

async function translateNodes(nodes: Text[], lang: string) {
  const toFetch: { node: Text; text: string }[] = [];
  for (const node of nodes) {
    const original = node.nodeValue || '';
    const cached = getCached(lang, original);
    if (cached !== null) {
      originalByNode.set(node, original);
      if (node.isConnected) node.nodeValue = cached;
      appliedByNode.set(node, cached);
    } else {
      toFetch.push({ node, text: original });
    }
  }
  const chunkSize = 40;
  for (let i = 0; i < toFetch.length; i += chunkSize) {
    const chunk = toFetch.slice(i, i + chunkSize);
    // eslint-disable-next-line no-await-in-loop
    const translations = await translateBatch(chunk.map((c) => c.text), lang);
    chunk.forEach((c, idx) => applyTranslation(c.node, c.text, translations[idx] ?? c.text, lang));
  }
}

function pruneDisconnected() {
  for (const node of originalByNode.keys()) {
    if (!node.isConnected) { originalByNode.delete(node); appliedByNode.delete(node); }
  }
}

function scheduleFlush(lang: string) {
  if (flushTimer) window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    pruneDisconnected();
    const root = document.getElementById('root');
    if (!root) return;
    const nodes = collectTextNodes(root);
    if (nodes.length) translateNodes(nodes, lang);
  }, 200);
}

function setDocumentDirection(lang: string) {
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
}

export function revertToOriginal() {
  for (const [node, original] of originalByNode.entries()) {
    if (node.isConnected) node.nodeValue = original;
  }
  originalByNode.clear();
  appliedByNode.clear();
  setDocumentDirection('en');
}

export function stopAutoTranslate() {
  if (observer) { observer.disconnect(); observer = null; }
  if (flushTimer) { window.clearTimeout(flushTimer); flushTimer = null; }
}

export function startAutoTranslate(lang: string) {
  stopAutoTranslate();
  currentLang = lang;
  if (lang === 'en') { revertToOriginal(); return; }
  const root = document.getElementById('root');
  if (!root) return;
  setDocumentDirection(lang);
  scheduleFlush(lang);
  observer = new MutationObserver(() => scheduleFlush(lang));
  observer.observe(root, { childList: true, subtree: true, characterData: true });
}

export function getStoredLang(): string {
  try { return localStorage.getItem(STORAGE_KEY) || 'en'; } catch { return 'en'; }
}

export function setStoredLang(lang: string) {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
}

export function getCurrentLang(): string {
  return currentLang;
}

export function setSiteLanguage(lang: string) {
  setStoredLang(lang);
  startAutoTranslate(lang);
}

export function initSiteLanguage() {
  const lang = getStoredLang();
  currentLang = lang;
  if (lang !== 'en') startAutoTranslate(lang);
}
