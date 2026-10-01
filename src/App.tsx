import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ChevronDown, Clock3, Copy, Download, Globe2, Heart, Languages, Lightbulb, LogIn, Menu, Search, ShieldCheck, Sparkles, Trophy, UserPlus, Volume2, WifiOff, X, Zap } from 'lucide-react';
import { achievements, categories, techCategories, futurePaths, inventions, lessons, timeline, translations, type Category, type Lesson } from './data';
import { siteLanguages, getStoredLang, setSiteLanguage } from './i18n';
import HeroIllustration from './HeroIllustration';

const navItems = [['/subjects', 'Subjects'], ['/learn', 'Learn'], ['/translate', 'Languages'], ['/offline', 'Offline'], ['/books', 'Books'], ['/impact', 'Impact'], ['/about', 'About']];
const useStored = <T,>(key: string, initial: T) => { const [value, setValue] = useState<T>(() => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? initial; } catch { return initial; } }); useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]); return [value, setValue] as const; };

function Navbar({ onLanguage }: { onLanguage: () => void }) {
  const [menu, setMenu] = useState(false); const [online, setOnline] = useState(navigator.onLine); const [user, setUser] = useState<{ name: string; email: string } | null>(null); const [scrolled, setScrolled] = useState(false); const navigate = useNavigate();
  useEffect(() => { const on = () => setOnline(true); const off = () => setOnline(false); addEventListener('online', on); addEventListener('offline', off); return () => { removeEventListener('online', on); removeEventListener('offline', off); }; }, []);
  useEffect(() => { fetch('/api/auth/me', { credentials: 'include' }).then(response => response.ok ? response.json() : { user: null }).then(data => setUser(data.user)).catch(() => setUser(null)); }, []);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 10); onScroll(); addEventListener('scroll', onScroll, { passive: true }); return () => removeEventListener('scroll', onScroll); }, []);
  return <header className={scrolled ? 'navbar scrolled' : 'navbar'}><Link to="/" className="brand"><span className="brand-mark"><Globe2 size={22}/></span><span>OpenLearn <b>World</b><small>Knowledge without borders.</small></span></Link><button className="lang-trigger" onClick={onLanguage} aria-label="Website language"><Languages size={17}/></button><button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Open navigation">{menu ? <X/> : <Menu/>}</button><nav className={menu ? 'nav-links open' : 'nav-links'}>{navItems.map(([url, label]) => <NavLink key={url} to={url} onClick={() => setMenu(false)}>{label}</NavLink>)}<button className="nav-search" onClick={() => navigate('/learn')}><Search size={17}/> Search</button><span className="status-pill"><span className={online ? 'status-dot online' : 'status-dot'}></span>{online ? 'Online' : 'Offline — still learning'}</span><NavLink to={user ? '/profile' : '/login'} className="profile-link" onClick={() => setMenu(false)}><span className="avatar">{user ? user.name.charAt(0).toUpperCase() : 'L'}</span> {user ? user.name : 'Sign in'}</NavLink></nav></header>;
}
function Footer() { return <footer><div className="footer-main"><Link to="/" className="brand"><span className="brand-mark"><Globe2 size={19}/></span><span>OpenLearn <b>World</b><small>Free knowledge should have no borders.</small></span></Link><p>Built for children, families, schools, and communities everywhere.<br/>Learning is free. Sustainability is supported through responsible advertising and future partnerships.</p></div><div className="footer-links"><div><b>Explore</b><Link to="/learn">Learn</Link><Link to="/translate">Languages</Link><Link to="/offline">Offline learning</Link></div><div><b>Connect</b><Link to="/impact">Impact</Link><Link to="/about">About</Link><Link to="/partnerships">Partnerships</Link><Link to="/contact">Contact</Link></div><div><b>Care</b><Link to="/faq">FAQ</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/child-safety">Child safety</Link></div></div><div className="footer-bottom">© 2026 OpenLearn World · Demo concept, not a claim of current impact <span>Made for real-world devices.</span></div></footer>; }
function LanguageMenu({ close }: { close: () => void }) { const [lang, setLang] = useState(getStoredLang()); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const choose = async (code: string) => { if (busy) return; setLang(code); setBusy(true); setError(''); let ok = true; try { ok = await setSiteLanguage(code); } catch { ok = false; } finally { setBusy(false); } if (code === 'en') { close(); return; } if (!ok) setError('Translation is temporarily unavailable (the AI service is busy or over its quota). Please try again in a few minutes.'); }; return <div className="a11y-popover lang-popover" data-no-translate><div className="popover-title"><b>Website language</b><button onClick={close}><X size={17}/></button></div><div className="lang-options">{siteLanguages.map(([code, label]) => <button key={code} disabled={busy} className={code === lang ? 'lang-option selected' : 'lang-option'} onClick={() => choose(code)}>{label}</button>)}</div>{busy && <small>Translating the page, please wait...</small>}{error && <small className="lang-error">{error}</small>}<small>AI-translated from English — English stays the original.</small></div>; }
function Layout({ children }: { children: React.ReactNode }) { const [langOpen, setLangOpen] = useState(false); const [large] = useStored('olw-large-text', false); const [reduced] = useStored('olw-reduced-motion', false); const mainRef = useRef<HTMLElement>(null); useEffect(() => { document.body.classList.toggle('large-text', large); document.body.classList.toggle('reduced-motion', reduced); }, [large, reduced]); useEffect(() => { const root = mainRef.current; if (!root || reduced) return; const targets = root.querySelectorAll('.page-section, .hero, .mission-band, .story-strip, .tech-tracks-section, .sponsor-slot, .auth-page, .final-cta'); if (!targets.length) return; targets.forEach((el) => el.classList.add('reveal-init')); const io = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }); targets.forEach((el) => io.observe(el)); return () => io.disconnect(); }, [children, reduced]); return <><Navbar onLanguage={() => setLangOpen(!langOpen)}/>{langOpen && <LanguageMenu close={() => setLangOpen(false)}/>}<main ref={mainRef}>{children}</main><Footer/></>; }
function Button({ children, secondary = false, to, onClick }: { children: React.ReactNode; secondary?: boolean; to?: string; onClick?: () => void }) { const className = secondary ? 'button button-secondary' : 'button'; return to ? <Link className={className} to={to}>{children}</Link> : <button className={className} onClick={onClick}>{children}</button>; }
function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) { return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{body && <p>{body}</p>}</div>; }
function LessonCard({ lesson, onStart }: { lesson: Lesson; onStart?: () => void }) { return <article className="lesson-card"><div className="lesson-card-top"><span className={`category-tag ${lesson.category.toLowerCase()}`}>{lesson.category}</span>{lesson.offline && <span className="offline-label"><Download size={13}/> Offline</span>}</div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="lesson-meta"><span><Clock3 size={14}/> {lesson.minutes} min</span><span className="difficulty">{lesson.difficulty}</span></div><button onClick={onStart} className="card-link">Start lesson <ArrowRight size={16}/></button></article>; }
const techTracks: { id: string; icon: string; title: string; blurb: string; detail: string; status: 'live' | 'soon'; href?: string; stat: string; grad: string }[] = [
  { id: 'arduino', icon: '🔌', title: 'Arduino', blurb: 'Real hardware, real pins.', detail: 'A 3D board you can rotate and click, accurate pinout data, and 9 real sensor circuits — LED, button, potentiometer, ultrasonic, servo, DHT11, PIR, buzzer — each with wiring, code, and working simulators.', status: 'live', href: '/tech/arduino.html', stat: '9 lessons', grad: 'linear-gradient(135deg,#22d3ee,#6366f1)' },
  { id: 'esp32', icon: '📶', title: 'ESP32', blurb: 'Same ideas, now wireless.', detail: 'The same hands-on approach as Arduino, adapted to 3.3V logic, with a Wi-Fi web server project and a real DevKit pinout.', status: 'live', href: '/tech/esp32.html', stat: '7 lessons', grad: 'linear-gradient(135deg,#818cf8,#c084fc)' },
  { id: 'academy', icon: '🎨', title: 'InclusiveCode Academy', blurb: 'Code and see it move.', detail: 'A live Processing/p5.js and HTML editor with instant visual output, an AI coding mentor, and a free book library.', status: 'live', href: '/academy.html', stat: 'Live workspace', grad: 'linear-gradient(135deg,#34d399,#10b981)' },
  { id: 'webdev', icon: '🌐', title: 'Web Development', blurb: 'Your first site, live.', detail: 'HTML, CSS, and JavaScript from a blank page to a deployed, responsive site — with a live editor and instant preview at every step.', status: 'live', href: '/tech/webdev.html', stat: '8 lessons', grad: 'linear-gradient(135deg,#fb923c,#f43f5e)' },
  { id: 'blender', icon: '🧊', title: 'Blender 3D', blurb: 'Model, texture, render.', detail: 'A labeled interface tour, the official download link, and your first model — box modeling to a finished render.', status: 'live', href: '/tech/blender.html', stat: '6 lessons', grad: 'linear-gradient(135deg,#fbbf24,#fb7185)' },
  { id: 'gamedev', icon: '🎮', title: 'Game Development', blurb: 'From idea to playable.', detail: 'Core game-design concepts, a real playable canvas demo you can inspect, and an honest comparison of engines.', status: 'live', href: '/tech/gamedev.html', stat: '6 lessons', grad: 'linear-gradient(135deg,#a78bfa,#f472b6)' },
  { id: 'roblox', icon: '🟥', title: 'Roblox Studio', blurb: 'Script and publish.', detail: 'Install Roblox Studio, learn Luau scripting basics with real examples, and publish your first experience.', status: 'live', href: '/tech/roblox.html', stat: '6 lessons', grad: 'linear-gradient(135deg,#f87171,#fb923c)' },
];

function TechTracksSection() {
  return <section className="tech-tracks-section">
    <div className="page-section" style={{ paddingBottom: 0 }}>
      <SectionHeading eyebrow="🚀 Free technical courses" title="Pick something to build." body="Real specs, real diagrams, real code — not summaries. Every track below is fully built and free, no account required."/>
    </div>
    <div className="tech-huge-grid">
      {techTracks.map((t) => <a href={t.href} key={t.id} className="tech-huge-card" style={{ '--card-grad': t.grad } as React.CSSProperties}>
        <span className="tech-huge-icon">{t.icon}</span>
        <h3>{t.title}</h3>
        <p className="tech-huge-blurb">{t.blurb}</p>
        <p className="tech-huge-detail">{t.detail}</p>
        <div className="tech-huge-foot">
          <span className="tech-stat live">● {t.stat}</span>
          <span className="tech-huge-cta">Start <ArrowRight size={15}/></span>
        </div>
      </a>)}
    </div>
  </section>;
}

function SubjectDiscovery() {
  return <section className="page-section subject-discovery">
    <SectionHeading eyebrow="🌍 Explore the world of learning" title="A subject for every kind of curious." body="Nine school subjects, each with real lessons, quizzes, and facts to explore — pick one and go."/>
    <div className="discovery-grid">
      {categories.map((c) => <Link key={c.name} to={`/learn/${c.name.toLowerCase()}`} className={`discovery-tile tone-${c.tone}`}>
        <span className="discovery-emoji">{c.emoji}</span>
        <b>{c.name}</b>
        <small>{c.description}</small>
        <span className="discovery-count">{lessons.filter((l) => l.category === c.name).length} lessons</span>
      </Link>)}
    </div>
  </section>;
}

function InteractiveDiscovery() {
  const picks: { label: string; emoji: string; category: Category }[] = [
    { label: 'How things move', emoji: '⚡', category: 'Physics' },
    { label: 'Mixing & fizzing', emoji: '🧪', category: 'Chemistry' },
    { label: 'My body & nature', emoji: '🌱', category: 'Biology' },
    { label: 'People from the past', emoji: '🏛️', category: 'History' },
    { label: 'Clever inventions', emoji: '💡', category: 'Inventions' },
    { label: 'How computers work', emoji: '💻', category: 'Computers' },
  ];
  const [picked, setPicked] = useState<Category | null>(null);
  const navigate = useNavigate();
  const match = useMemo(() => picked ? lessons.find((l) => l.category === picked) : null, [picked]);
  return <section className="page-section interactive-discovery">
    <SectionHeading eyebrow="🎯 Not sure where to start?" title="Tell us what you're curious about." body="This picks a real lesson from our library — try it."/>
    <div className="discovery-picks">
      {picks.map((p) => <button key={p.category} className={picked === p.category ? 'discovery-pick active' : 'discovery-pick'} onClick={() => setPicked(p.category)}>
        <span>{p.emoji}</span>{p.label}
      </button>)}
    </div>
    {match && <div className="discovery-result">
      <span className="category-tag">{match.category}</span>
      <h3>{match.title}</h3>
      <p>{match.description}</p>
      <Button onClick={() => navigate(`/learn/lesson/${match.id}`)}>Start this lesson <ArrowRight size={16}/></Button>
    </div>}
  </section>;
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Discover', body: 'Browse subjects and hands-on tech tracks, or ask the picker above to suggest one.', icon: Search },
    { n: '02', title: 'Learn', body: 'Read short facts, try a real activity or a working simulator, then check your understanding with a quiz.', icon: BookOpen },
    { n: '03', title: 'Explore further', body: 'Save your progress, switch the whole site to your language, or open a lesson again offline.', icon: Sparkles },
  ];
  return <section className="page-section how-it-works">
    <SectionHeading eyebrow="How learning works here" title="Three simple steps, no account required."/>
    <div className="how-steps">
      {steps.map((s) => <div className="how-step" key={s.n}>
        <span className="how-step-num">{s.n}</span>
        <span className="icon-tile"><s.icon size={20}/></span>
        <b>{s.title}</b>
        <p>{s.body}</p>
      </div>)}
    </div>
  </section>;
}

function LanguageAccessSection() {
  return <section className="page-section language-access">
    <div className="language-access-grid">
      <div>
        <SectionHeading eyebrow="🗣️ Language access" title="Learn in your own words." body="Switch the whole site's language with one click, powered by AI translation — plus a growing Bangla phrasebook with pronunciation guides for real words kids use every day."/>
        <div className="lang-chip-row">{siteLanguages.map(([code, label]) => <span key={code} className="lang-chip">{label}</span>)}</div>
        <Button to="/translate" secondary>Try the translator <ArrowRight size={16}/></Button>
      </div>
      <div className="bangla-preview">
        {translations.slice(0, 4).map((t) => <div className="bangla-row" key={t.english}>
          <span className="bangla-en">{t.english}</span>
          <span className="bangla-word">{t.bangla}</span>
          <span className="bangla-pron">{t.pronunciation}</span>
        </div>)}
      </div>
    </div>
  </section>;
}

function OfflineHighlight() {
  return <section className="page-section offline-highlight">
    <div className="offline-highlight-grid">
      <div className="offline-highlight-visual"><WifiOff size={32}/><div className="offline-highlight-bars"><span></span><span></span><span></span></div></div>
      <div>
        <SectionHeading eyebrow="📶 Offline learning" title="A weak signal shouldn't end a lesson." body="Pages you've already opened stay available through your browser's offline cache, and a sample learning pack can be saved to this device — no account needed."/>
        <Button to="/offline" secondary>See how offline works <ArrowRight size={16}/></Button>
      </div>
    </div>
  </section>;
}

function HomeFAQ() {
  const questions: [string, string][] = [
    ['Is it really free?', 'Yes. Core lessons, the tech tracks, and the translator are free to use, with no paywall on learning.'],
    ['Do I need an account?', 'No. You can browse and complete lessons without signing in — an account only helps save progress across devices.'],
    ['Which languages are supported?', `The whole site can switch to ${siteLanguages.length} languages, including Bangla, Spanish, Hindi, Arabic, and French, with a dedicated Bangla pronunciation phrasebook.`],
    ['Does it work offline?', 'Pages you have already visited stay available through your browser, and a sample pack can be saved for offline use.'],
    ['Who is it designed for?', 'The core lessons are written for children roughly 5–10 years old, with tech tracks and deeper subjects for older, curious learners too.'],
  ];
  return <section className="page-section home-faq">
    <SectionHeading eyebrow="Questions worth asking" title="A few honest answers."/>
    <div className="faq-list">{questions.map(([q, a]) => <details key={q}><summary>{q}<ChevronDown size={18}/></summary><p>{a}</p></details>)}</div>
    <Link to="/faq" className="card-link">More questions <ArrowRight size={16}/></Link>
  </section>;
}

function FinalCTA() {
  return <section className="final-cta">
    <div className="final-cta-inner">
      <span className="eyebrow">Ready when you are</span>
      <h2>Your next lesson is one click away.</h2>
      <p>No account, no cost, no catch — just pick something and start.</p>
      <div className="hero-actions"><Button to="/subjects">Start learning <ArrowRight size={17}/></Button><a className="button button-secondary" href="/tech/index.html">Browse tech tracks</a></div>
    </div>
  </section>;
}

function Home() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">A global learning initiative</span>
        <h1>A world of knowledge,<br/><em>open to everyone.</em></h1>
        <p>Free lessons, hands-on tech tracks, and a translator that speaks your language — built to reach learners even where the internet cannot.</p>
        <div className="hero-actions"><Button to="/subjects">Start learning for free <ArrowRight size={17}/></Button><Button to="/learn" secondary>Explore learning</Button></div>
        <div className="hero-proof"><span><Check size={16}/> Free core content</span><span><Check size={16}/> No account required</span><span><Check size={16}/> Works offline</span></div>
      </div>
      <div className="world-visual">
        <HeroIllustration/>
      </div>
    </section>
    <TechTracksSection/>
    <SubjectDiscovery/>
    <InteractiveDiscovery/>
    <section className="mission-band">
      <div><span className="eyebrow">The access gap</span><h2>Education shouldn't depend on your postcode.</h2></div>
      <p>Millions of children face barriers to quality education because of poverty, geography, language, connectivity, or a lack of learning resources. OpenLearn World is a free, multilingual starting point — and an honest conversation about what must come next.</p>
    </section>
    <HowItWorks/>
    <section className="page-section">
      <SectionHeading eyebrow="Learning for everyone" title="Learning that meets people where they are." body="Technology is only useful when it respects the realities of the people it hopes to serve."/>
      <div className="feature-grid">{[['Learn for free','Core learning content is available to everyone.',BookOpen,'/subjects'],['Learn offline','Save sample packs and continue when the connection goes away.',WifiOff,'/offline'],['Explore knowledge','History, science, inventions, computers, and more.',Sparkles,'/subjects'],['Learn languages','Translations and pronunciation support for new words.',Languages,'/translate'],['Learn by doing','Interactive activities help ideas stick.',Lightbulb,'/learn'],['Built for everyone','Designed with low-connectivity communities in mind.',Heart,'/impact']].map(([title, text, Icon, href]) => <Link to={href as string} className="feature-card" key={title as string}><span className="icon-tile"><Icon size={21}/></span><h3>{title as string}</h3><p>{text as string}</p><ArrowRight size={17}/></Link>)}</div>
    </section>
    <LanguageAccessSection/>
    <OfflineHighlight/>
    <section className="page-section narrow-section">
      <div className="device-callout">
        <div><span className="eyebrow">The question we refuse to hide</span><h2>But what if there is no phone?</h2><p>An offline app still requires a device. For millions of children, even owning or accessing a smartphone may be difficult. Solving education inequality requires more than software.</p><Button to="/about" secondary>See the future pathways <ArrowRight size={16}/></Button></div>
        <div className="pathway-list">{futurePaths.slice(0, 5).map((path, i) => <span key={path}><small>0{i + 1}</small>{path}</span>)}</div>
      </div>
    </section>
    <HomeFAQ/>
    <section className="sponsor-slot"><span>Sponsored</span><b>Supporters help keep learning free.</b><small>Educational content is never interrupted by advertising.</small></section>
    <FinalCTA/>
  </>;
}
function Subjects() {
  const navigate = useNavigate();
  const allTiles = useMemo(() => [
    ...techCategories.map((c) => ({ id: c.name, emoji: c.emoji, title: c.name, blurb: c.description, tone: c.tone, href: c.href, count: null as number | null })),
    ...categories.map((c) => ({ id: c.name, emoji: c.emoji, title: c.name, blurb: c.description, tone: c.tone, href: `/learn/${c.name.toLowerCase()}`, count: lessons.filter((l) => l.category === c.name).length }))
  ], []);
  const surpriseMe = () => {
    const pick = allTiles[Math.floor(Math.random() * allTiles.length)];
    if (pick.href.startsWith('/tech/') || pick.href.startsWith('/academy')) window.location.href = pick.href;
    else navigate(pick.href);
  };
  return <section className="page-section subjects-page">
    <div className="subjects-hero">
      <span className="eyebrow">🎒 Pick your adventure</span>
      <h1>What do YOU want to learn today?</h1>
      <p>Tap a tile below, or let us surprise you!</p>
      <button className="surprise-btn" onClick={surpriseMe}>🎲 Surprise me!</button>
    </div>
    <div className="subject-tiles">
      {allTiles.map((t) => {
        const inner = <><span className="subject-tile-emoji">{t.emoji}</span><b>{t.title}</b><small>{t.blurb}</small>{t.count !== null && <span className="subject-tile-count">{t.count} lessons</span>}</>;
        return t.href.startsWith('/learn/')
          ? <Link key={t.id} to={t.href} className={`subject-tile tone-${t.tone}`}>{inner}</Link>
          : <a key={t.id} href={t.href} className={`subject-tile tone-${t.tone}`}>{inner}</a>;
      })}
    </div>
  </section>;
}
function Learn() { const { subject } = useParams(); const subjectCategory = categories.find(c => c.name.toLowerCase() === subject?.toLowerCase())?.name; const [query, setQuery] = useState(''); const [category, setCategory] = useState<Category | 'All'>(subjectCategory || 'All'); const navigate = useNavigate(); useEffect(() => { setCategory(subjectCategory || 'All'); }, [subjectCategory]); const q = query.trim().toLowerCase(); const searching = q.length > 0; const results = useMemo(() => lessons.filter(l => (category === 'All' || l.category === category) && (!q || `${l.title} ${l.description} ${l.category} ${l.facts.join(' ')} ${l.question}`.toLowerCase().includes(q))), [q, category]); const matchedTech = useMemo(() => searching ? techCategories.filter(c => `${c.name} ${c.description}`.toLowerCase().includes(q)) : [], [q, searching]); const showBrowse = !searching || (results.length === 0 && matchedTech.length === 0); return <section className="page-section learn-page"><SectionHeading eyebrow={subjectCategory ? `${subjectCategory} library` : 'Your learning library'} title={subjectCategory ? `Explore ${subjectCategory}.` : 'What do you want to explore?'} body="Choose a topic, take a few minutes, and leave with one new idea."/><div className="search-row"><div className="search-box"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search lessons, inventions, people, ideas..." aria-label="Search lessons"/></div><select value={category} onChange={e => setCategory(e.target.value as Category | 'All')}><option>All</option>{categories.map(c => <option key={c.name}>{c.name}</option>)}</select></div>{searching && matchedTech.length > 0 && <><div className="section-head"><span className="eyebrow">🛠️ Matching courses</span></div><div className="category-grid">{matchedTech.map(c => <a key={c.name} href={c.href} className={`category-card ${c.tone} tech-category-card`}><span className="external-badge">Full course ↗</span><span className="tech-emoji">{c.emoji}</span><b>{c.name}</b><small>{c.description}</small></a>)}</div></>}{showBrowse && <><div className="section-head"><span className="eyebrow">🛠️ Build & code</span><h2 style={{ font: '600 22px Fraunces, serif', margin: '6px 0 4px' }}>Start here: hands-on tech tracks.</h2><p style={{ color: 'var(--muted)', fontSize: 13 }}>Each one opens a complete course — with diagrams, code, and interactive simulators — not just a quick lesson card.</p></div><div className="category-grid">{techCategories.map(c => <a key={c.name} href={c.href} className={`category-card ${c.tone} tech-category-card`}><span className="external-badge">Full course ↗</span><span className="tech-emoji">{c.emoji}</span><b>{c.name}</b><small>{c.description}</small></a>)}</div><div className="section-head" style={{ marginTop: 34 }}><span className="eyebrow">📚 School subjects</span><h2 style={{ font: '600 22px Fraunces, serif', margin: '6px 0 4px' }}>Or explore a subject.</h2></div><div className="category-grid">{categories.map(c => <Link key={c.name} to={`/learn/${c.name.toLowerCase()}`} className={`category-card ${c.tone} ${subjectCategory === c.name ? 'selected' : ''}`}><span className="icon-tile"><Sparkles size={19}/></span><b>{c.name}</b><small>{c.description}</small></Link>)}</div></>}<div className="results-heading"><h2>{searching || category !== 'All' ? 'Search results' : 'Featured lessons'}</h2><span>{results.length} lessons</span></div>{results.length ? <div className="lesson-grid">{results.map(lesson => <LessonCard key={lesson.id} lesson={lesson} onStart={() => navigate(`/learn/lesson/${lesson.id}`)}/>)}</div> : <EmptyState title="No lessons found" body={searching ? `No lessons matched "${query.trim()}" — try a shorter word, or browse a subject below.` : 'Try another phrase or explore one of the categories above.'}/>}</section>; }
function EmptyState({ title, body }: { title: string; body: string }) { return <div className="empty-state"><Search size={24}/><h3>{title}</h3><p>{body}</p></div>; }
function LessonVisual({ id }: { id: string }) {
  const box = (children: React.ReactNode) => <svg width="100%" height="170" viewBox="0 0 260 170" role="img" aria-label="Lesson diagram">{children}</svg>;
  switch (id) {
    case 'physics-motion': return box(<>
      <rect x="30" y="90" width="50" height="50" rx="10" fill="#a8c8d2"/>
      <text x="55" y="120" textAnchor="middle" fontSize="22">🚗</text>
      <line x1="90" y1="115" x2="160" y2="115" stroke="#dd765c" strokeWidth="4" markerEnd="url(#arrowC)"/>
      <text x="120" y="103" textAnchor="middle" fontSize="13" fontWeight="700" fill="#dd765c">PUSH!</text>
      <line x1="30" y1="150" x2="230" y2="150" stroke="#71847c" strokeWidth="2"/>
      <text x="130" y="30" textAnchor="middle" fontSize="14" fontWeight="700" fill="#203b35">A little push makes it zoom!</text>
      <defs><marker id="arrowC" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#dd765c"/></marker></defs>
    </>);
    case 'physics-circuit': return box(<>
      <rect x="40" y="40" width="180" height="90" fill="none" stroke="#203b35" strokeWidth="3"/>
      <rect x="105" y="30" width="50" height="20" fill="#eabf64" stroke="#203b35" strokeWidth="2"/>
      <text x="130" y="24" textAnchor="middle" fontSize="11" fill="#203b35">🔋 the pump</text>
      <rect x="105" y="120" width="50" height="20" fill="#dd765c" stroke="#203b35" strokeWidth="2"/>
      <text x="130" y="155" textAnchor="middle" fontSize="11" fill="#203b35">💡 the light</text>
      <line x1="180" y1="60" x2="180" y2="100" stroke="#7fae93" strokeWidth="3" markerEnd="url(#arrowD)"/>
      <text x="200" y="85" fontSize="11" fill="#7fae93">flow</text>
      <defs><marker id="arrowD" markerWidth="8" markerHeight="8" refX="4" refY="6" orient="auto"><path d="M0,0 L8,0 L4,8 Z" fill="#7fae93"/></marker></defs>
    </>);
    case 'physics-energy': return box(<>
      <path d="M20 140 Q130 20 240 140" fill="none" stroke="#71847c" strokeWidth="2"/>
      <circle cx="30" cy="128" r="12" fill="#dd765c"/>
      <text x="30" y="105" textAnchor="middle" fontSize="10" fontWeight="700" fill="#dd765c">PE high</text>
      <circle cx="230" cy="128" r="12" fill="#a8c8d2"/>
      <text x="230" y="105" textAnchor="middle" fontSize="10" fontWeight="700" fill="#4a7f8c">KE building</text>
      <circle cx="130" cy="22" r="0" fill="none"/>
      <text x="130" y="155" textAnchor="middle" fontSize="11" fill="#203b35">energy changes form, never disappears</text>
    </>);
    case 'physics-wave': return box(<>
      <path d="M10 90 Q45 30 80 90 T150 90 T220 90" fill="none" stroke="#a8c8d2" strokeWidth="3"/>
      <line x1="45" y1="30" x2="45" y2="90" stroke="#dd765c" strokeWidth="1.5" strokeDasharray="3 3"/>
      <text x="30" y="55" fontSize="10" fill="#dd765c">amplitude</text>
      <line x1="45" y1="150" x2="115" y2="150" stroke="#7fae93" strokeWidth="1.5"/>
      <text x="80" y="165" textAnchor="middle" fontSize="10" fill="#4a7f6a">wavelength</text>
    </>);
    case 'chem-atom': return box(<>
      <circle cx="130" cy="85" r="65" fill="none" stroke="#c8c1d7" strokeWidth="1.5" strokeDasharray="2 3"/>
      <circle cx="130" cy="85" r="40" fill="none" stroke="#a8c8d2" strokeWidth="1.5" strokeDasharray="2 3"/>
      <circle cx="130" cy="85" r="14" fill="#dd765c"/>
      <text x="130" y="89" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">p+n</text>
      <circle cx="170" cy="85" r="5" fill="#7fae93"/>
      <circle cx="90" cy="60" r="5" fill="#7fae93"/>
      <circle cx="130" cy="20" r="5" fill="#7fae93"/>
      <text x="130" y="160" textAnchor="middle" fontSize="10" fill="#203b35">electrons orbit the nucleus</text>
    </>);
    case 'chem-states': return box(<>
      {[[20, 'Solid', '#a8c8d2', 3], [100, 'Liquid', '#7fae93', 2], [180, 'Gas', '#dd765c', 1]].map(([x, label, color, density]: any) => <g key={label}>
        <rect x={x} y={20} width="60" height="100" fill="none" stroke="#203b35" strokeWidth="1.5"/>
        {Array.from({ length: density === 3 ? 9 : density === 2 ? 6 : 5 }).map((_, i) => <circle key={i} cx={x + 12 + (i % 3) * 18} cy={density === 1 ? 30 + Math.random() * 80 : 30 + Math.floor(i / 3) * 30} r="5" fill={color}/>)}
        <text x={x + 30} y={140} textAnchor="middle" fontSize="11" fill="#203b35">{label}</text>
      </g>)}
    </>);
    case 'chem-reaction': return box(<>
      <text x="55" y="90" textAnchor="middle" fontSize="13" fill="#203b35">2H₂</text>
      <text x="55" y="60" textAnchor="middle" fontSize="10" fill="#71847c">+</text>
      <text x="55" y="40" textAnchor="middle" fontSize="13" fill="#203b35">O₂</text>
      <line x1="90" y1="70" x2="150" y2="70" stroke="#dd765c" strokeWidth="3" markerEnd="url(#arrowE)"/>
      <text x="200" y="75" textAnchor="middle" fontSize="13" fill="#203b35">2H₂O</text>
      <text x="120" y="150" textAnchor="middle" fontSize="10" fill="#71847c">reactants → products (balanced atoms)</text>
      <defs><marker id="arrowE" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#dd765c"/></marker></defs>
    </>);
    case 'chem-ph': return box(<>
      <rect x="15" y="70" width="230" height="24" rx="4" fill="url(#phGrad)"/>
      <defs><linearGradient id="phGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#dd765c"/><stop offset="50%" stopColor="#eabf64"/><stop offset="100%" stopColor="#7fae93"/></linearGradient></defs>
      <line x1="130" y1="60" x2="130" y2="104" stroke="#203b35" strokeWidth="2"/>
      <text x="130" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fill="#203b35">7 (neutral)</text>
      <text x="15" y="115" fontSize="10" fill="#203b35">0 — acidic</text>
      <text x="215" y="115" fontSize="10" fill="#203b35">14 — basic</text>
    </>);
    case 'bio-cell': return box(<>
      <ellipse cx="130" cy="85" rx="105" ry="65" fill="#eafaf0" stroke="#7fae93" strokeWidth="3"/>
      <circle cx="105" cy="75" r="28" fill="#a8c8d2"/>
      <text x="105" y="79" textAnchor="middle" fontSize="10" fill="#203b35">Nucleus</text>
      <ellipse cx="175" cy="100" rx="18" ry="10" fill="#dd765c"/>
      <text x="175" y="122" textAnchor="middle" fontSize="9" fill="#203b35">Mitochondria</text>
      <text x="130" y="160" textAnchor="middle" fontSize="10" fill="#71847c">a typical animal cell</text>
    </>);
    case 'bio-photosynthesis': return box(<>
      <circle cx="35" cy="30" r="18" fill="#eabf64"/>
      <text x="35" y="60" textAnchor="middle" fontSize="9" fill="#203b35">sunlight</text>
      <path d="M110 130 Q90 60 150 40 Q160 90 110 130 Z" fill="#7fae93"/>
      <text x="130" y="150" textAnchor="middle" fontSize="10" fill="#203b35">leaf</text>
      <line x1="55" y1="40" x2="105" y2="65" stroke="#eabf64" strokeWidth="2" markerEnd="url(#arrowF)"/>
      <text x="215" y="45" fontSize="11" fill="#4a7f8c">O₂ out</text>
      <line x1="160" y1="55" x2="205" y2="45" stroke="#a8c8d2" strokeWidth="2" markerEnd="url(#arrowF)"/>
      <text x="200" y="115" fontSize="10" fill="#71847c">CO₂ + H₂O in</text>
      <line x1="195" y1="105" x2="150" y2="85" stroke="#71847c" strokeWidth="2" markerEnd="url(#arrowF)"/>
      <defs><marker id="arrowF" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#71847c"/></marker></defs>
    </>);
    case 'bio-body': return box(<>
      {[['❤️', 'Circulatory', 40], ['🫁', 'Respiratory', 130], ['🍽️', 'Digestive', 220]].map(([icon, label, x]: any) => <g key={label}>
        <circle cx={x} cy="60" r="30" fill="#eafaf0" stroke="#7fae93" strokeWidth="2"/>
        <text x={x} y="72" textAnchor="middle" fontSize="26">{icon}</text>
        <text x={x} y="115" textAnchor="middle" fontSize="10" fill="#203b35">{label}</text>
      </g>)}
    </>);
    case 'bio-foodchain': return box(<>
      {[['☀️', 'Sun', 20], ['🌾', 'Grass', 90], ['🐇', 'Rabbit', 160], ['🦊', 'Fox', 230]].map(([icon, label, x]: any, i) => <g key={label}>
        <text x={x} y="75" textAnchor="middle" fontSize="28">{icon}</text>
        <text x={x} y="105" textAnchor="middle" fontSize="10" fill="#203b35">{label}</text>
        {i < 3 && <line x1={x + 20} y1="65" x2={x + 45} y2="65" stroke="#dd765c" strokeWidth="2" markerEnd="url(#arrowG)"/>}
      </g>)}
      <defs><marker id="arrowG" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#dd765c"/></marker></defs>
      <text x="130" y="150" textAnchor="middle" fontSize="10" fill="#71847c">energy flows from the sun through the chain</text>
    </>);
    default: return null;
  }
}
function LessonPage() { const { id } = useParams(); const lesson = lessons.find(l => l.id === id); const [progress, setProgress] = useStored<Record<string, { complete: boolean; score: number }>>('olw-lesson-progress', {}); const [selected, setSelected] = useState<number | null>(null); const [step, setStep] = useState(0); const navigate = useNavigate(); if (!lesson) return <section className="page-section"><EmptyState title="Looks like this lesson went exploring somewhere else." body="Return to the learning library and choose another path."/></section>; const answer = selected === lesson.answer; const complete = progress[lesson.id]?.complete; const finish = () => setProgress({ ...progress, [lesson.id]: { complete: true, score: answer ? 100 : 75 } }); return <section className="page-section lesson-page"><button className="back-link" onClick={() => navigate('/learn')}>← Back to lessons</button><div className="lesson-hero"><span className={`category-tag ${lesson.category.toLowerCase()}`}>{lesson.category}</span><h1>{lesson.title}</h1><p>{lesson.description}</p><div className="lesson-progress"><span style={{ width: `${complete ? 100 : ((step + 1) / 3) * 100}%` }}></span></div><small>{complete ? 'Lesson complete' : `Part ${step + 1} of 3`}</small></div><div className="lesson-content"><div className="lesson-main"><h2>{step === 0 ? "Let's wonder together! 🤔" : step === 1 ? '3 Cool Facts! 🌟' : "Quiz Time! 🎮"}</h2>{step < 2 ? <><p>{step === 0 ? `Get ready for "${lesson.title}"! Take a deep breath and get curious — you've got this.` : 'Here are 3 fun facts. Try to remember them!'}</p>{step === 1 && <ul className="fact-list">{lesson.facts.map(f => <li key={f}><Check size={17}/>{f}</li>)}</ul>}<button className="button" onClick={() => setStep(step + 1)}>Next <ArrowRight size={16}/></button></> : <><p>{lesson.question}</p><div className="quiz-options">{lesson.options.map((option, i) => <button key={option} className={selected === i ? i === lesson.answer ? 'correct' : 'incorrect' : ''} onClick={() => setSelected(i)}>{String.fromCharCode(65 + i)}. {option}</button>)}</div>{selected !== null && <div className={answer ? 'quiz-feedback good' : 'quiz-feedback'}>{answer ? '🎉 Yes! You got it! Great job!' : 'Not quite — look at the facts again and try once more. You can do it! 💪'}</div>}<button className="button" disabled={selected === null} onClick={finish}>{complete || selected === lesson.answer ? '🏆 All Done!' : 'Finish! 🎉'} <Check size={16}/></button></>}</div><aside className="lesson-side-note">{lesson.visual ? <><b className="visual-label">Picture it! 🎨</b><div className="lesson-visual"><LessonVisual id={lesson.visual}/></div></> : <><span className="icon-tile"><Lightbulb size={21}/></span><b>Fun Tip</b></>}<p>{lesson.visual ? 'Take your time — learning a little bit is still awesome! 🌈' : 'No rushing needed. Learning a little bit at a time is still a big win! 🌈'}</p></aside></div></section>; }
function Translate() { const [from, setFrom] = useState('English'); const [to, setTo] = useState('Bangla'); const [query, setQuery] = useState(''); const [favorite, setFavorite] = useStored<string[]>('olw-favorites', []); const [recent, setRecent] = useStored<string[]>('olw-recent', []); const result = translations.find(t => t.english.toLowerCase() === query.trim().toLowerCase()) || translations.find(t => t.english.toLowerCase().includes(query.trim().toLowerCase())); const swap = () => { setFrom(to); setTo(from); }; const choose = (phrase: string) => { setQuery(phrase); setRecent([...new Set([phrase, ...recent])].slice(0, 5)); }; const speak = () => { if (result && 'speechSynthesis' in window) { const utterance = new SpeechSynthesisUtterance(result.bangla); utterance.lang = 'bn-BD'; speechSynthesis.speak(utterance); } }; return <section className="page-section translate-page"><SectionHeading eyebrow="Language learning" title="Let language travel." body="A friendly translation demo with a local dictionary. A real translation service can replace this data layer later."/><div className="translate-box"><div className="language-row"><label>Language from<select value={from} onChange={e => setFrom(e.target.value)}><option>English</option><option>Bangla</option><option>Spanish</option><option>French</option></select></label><button className="swap-button" onClick={swap} aria-label="Swap languages">⇄</button><label>Language to<select value={to} onChange={e => setTo(e.target.value)}><option>Bangla</option><option>English</option><option>Spanish</option><option>French</option></select></label></div><div className="translation-columns"><div><label className="field-label">{from}</label><textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="Type a word or phrase..."/></div><div className="translation-output"><label className="field-label">{to}</label>{result ? <><strong>{result.bangla}</strong><span className="pronunciation">/ {result.pronunciation} /</span><div className="translation-actions"><button onClick={speak}><Volume2 size={16}/> Speak</button><button onClick={() => navigator.clipboard?.writeText(result.bangla)}><Copy size={16}/> Copy</button><button onClick={() => setFavorite([...new Set([...favorite, result.english])])}><Heart size={16} fill={favorite.includes(result.english) ? 'currentColor' : 'none'}/> Favorite</button></div></> : <span className="translation-placeholder">Your new word will appear here.</span>}</div></div></div><div className="phrase-section"><div className="results-heading"><h2>Phrase garden</h2><span>Greetings · School · Family · Everyday</span></div><div className="phrase-grid">{translations.map(t => <button key={t.english} onClick={() => choose(t.english)}><small>{t.category}</small><b>{t.english}</b><strong>{t.bangla}</strong></button>)}</div></div>{recent.length > 0 && <p className="recent-line">Recent: {recent.join(' · ')}</p>}</section>; }
function Offline() { const [downloaded, setDownloaded] = useStored('olw-downloads', false); return <section className="page-section"><SectionHeading eyebrow="Offline-first by design" title="Learning shouldn't stop when the internet does." body="A connection is useful, but it should never be the price of curiosity. This demo keeps sample lessons and progress on your device."/><div className="offline-flow"><div><span>ONLINE</span><strong>Choose a learning pack</strong></div><ArrowRight/><div><span>DOWNLOAD</span><strong>Store on this device</strong></div><ArrowRight/><div><span>OFFLINE</span><strong>Keep learning anywhere</strong></div></div><div className="offline-grid"><article className="offline-card"><Download size={25}/><h3>Sample learning pack</h3><p>History, science, language phrases, and quizzes can stay available in this browser.</p><Button onClick={() => setDownloaded(true)}>{downloaded ? 'Pack saved' : 'Download for offline'} <Download size={16}/></Button></article><article className="offline-card"><WifiOff size={25}/><h3>Your progress stays yours</h3><p>Local progress, favorites, and accessibility preferences do not require an account or continuous connection.</p><span className="availability"><Check size={15}/> Available in demo</span></article></div><div className="device-challenge"><span className="eyebrow">The harder question</span><h2>But what if there is no phone?</h2><p>An offline app still requires a device. Future distribution pathways could include community learning centers, shared tablets, school partnerships, local servers, SD-card packs, refurbished devices, and teacher-led hubs.</p><Button to="/impact" secondary>Help us reach beyond the screen <ArrowRight size={16}/></Button></div></section>; }
function Books() { const [books, setBooks] = useState<{ slug: string; title: string; author: string; description: string; coverEmoji?: string; fileUrl: string; pages?: number }[] | null>(null); useEffect(() => { fetch('/api/books').then(response => response.json()).then(data => setBooks(data.books || [])).catch(() => setBooks([])); }, []); return <section className="page-section"><SectionHeading eyebrow="Free book library" title="Books to read, download, and keep." body="Every book here is free to view and download — no account needed. Read online or save a copy for offline learning."/>{books === null ? <p className="translation-placeholder">Loading the library...</p> : books.length === 0 ? <EmptyState title="No books published yet" body="Check back soon — new titles are on the way."/> : <div className="lesson-grid">{books.map(book => <article className="book-card" key={book.slug}><span className="book-cover">{book.coverEmoji || '📘'}</span><h3>{book.title}</h3><span className="book-author">by {book.author}{book.pages ? ` · ${book.pages} pages` : ''}</span><p>{book.description}</p><div className="book-actions"><a href={book.fileUrl} target="_blank" rel="noopener noreferrer">View</a><a className="download" href={book.fileUrl} download>Download</a></div></article>)}</div>}</section>; }
function AnimatedStat({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^([\d,]+)(.*)$/);
    if (!el || !match) { setDisplay(value); return; }
    const target = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = match[2];
    let started = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const duration = 1200;
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(target * eased).toLocaleString() + suffix);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <strong ref={ref}>{display}</strong>;
}
function Impact() { return <section className="page-section"><SectionHeading eyebrow="The mission" title="Technology is the tool. Access is the mission." body="These are directional goals, not current impact claims. We measure success by whether knowledge reaches people who are usually left out."/><div className="impact-stats">{[['10,000+', 'Learning resources', 'Vision'], ['20+', 'Languages planned', 'Goal'], ['50+', 'Community partners', 'Goal'], ['1', 'Shared promise', 'Free learning']].map(([number, label, tag]) => <div key={label}><AnimatedStat value={number}/><b>{label}</b><span>{tag}</span></div>)}</div><div className="impact-layout"><div className="world-placeholder"><div className="world-grid"></div><span className="map-word">REACH<br/><b>EVERYWHERE</b></span></div><div><span className="eyebrow">Future distribution pathways</span><h2>Reach beyond the screen.</h2><div className="pathway-columns">{futurePaths.map((p, i) => <span key={p}><small>{String(i + 1).padStart(2, '0')}</small>{p}</span>)}</div><Button to="/contact">Talk about partnership <ArrowRight size={16}/></Button></div></div></section>; }
function About() { return <section className="page-section story-page"><SectionHeading eyebrow="Why OpenLearn World" title="A free learning platform is only the beginning."/><div className="story-columns"><div><span className="eyebrow">The problem</span><h2>The world's access to knowledge is still unequal.</h2><p>A child's curiosity does not depend on their postcode, family income, or the strength of the local network. Their opportunities often do.</p></div><div><span className="eyebrow">The idea</span><h2>Build something that can travel beyond the internet.</h2><p>Free, multilingual, low-bandwidth learning can be one layer in a much bigger ecosystem of schools, communities, teachers, and partners.</p></div><div><span className="eyebrow">The approach</span><div className="approach-list">{['Free at the core', 'Offline-first', 'Multilingual', 'Accessible', 'Open to partnerships', 'Designed for low-resource environments'].map(x => <span key={x}><Check size={16}/>{x}</span>)}</div></div></div><div className="founder-question"><Sparkles size={24}/><p>Founded with a simple question:</p><strong>What if a child's access to knowledge didn't depend on their family's income?</strong></div></section>; }
function FAQ() { const questions = [['Is the platform really free?', 'Yes. Core educational content is designed to remain free. Responsible advertising and future partnerships are possible sustainability paths, never a paywall.'], ['How will the platform make money?', 'The long-term model may include responsible advertising, grants, sponsorships, donations, and institutional partnerships. None are presented as active systems here.'], ['Can I use it without internet?', 'The demo includes a service worker, local content, and local progress. Some future distribution formats will require deeper packaging for schools and communities.'], ['What if I do not have a smartphone?', 'That is a central challenge, not a hidden footnote. Community centers, shared devices, school partnerships, local servers, and teacher-led groups are possible pathways.'], ['Will it work on low-end devices?', 'The interface is designed to be light, responsive, and usable on older Android phones. The wider mission also goes beyond phones.'], ['Which languages will be supported?', 'The whole site can already switch to 12 languages — including Bangla, Spanish, Hindi, Arabic, French, German, Chinese, Japanese, Portuguese, Russian, and Urdu — with a dedicated Bangla pronunciation phrasebook.'], ['Can schools and NGOs use it?', 'The demo is ready for conversation, not a claim of an active partner program. Contact is the place to explore a future collaboration.'], ['How can I contribute?', 'Share feedback, connect the project with educators, or start a partnership conversation through the contact page.']]; return <section className="page-section faq-page"><SectionHeading eyebrow="Clear answers" title="Questions worth asking." body="We would rather be honest about the hard parts than hide them behind polished software."/><div className="faq-list">{questions.map(([q, a]) => <details key={q}><summary>{q}<ChevronDown size={18}/></summary><p>{a}</p></details>)}</div></section>; }
function SimplePage({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: React.ReactNode }) { return <section className="page-section simple-page"><SectionHeading eyebrow={eyebrow} title={title} body={body}/>{children}</section>; }
const googleAuthErrors: Record<string, string> = { google_unconfigured: 'Google sign-in is not configured on this server yet. Please sign in with email instead.', unconfigured: 'Google sign-in is not fully configured on this server yet. Please sign in with email instead.', failed: 'Google sign-in did not complete. Please try again or sign in with email.' };
function GoogleIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.344 0-4.3282-1.5831-5.0359-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"/><path fill="#FBBC05" d="M3.9641 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9641 10.71z"/><path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9641 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"/></svg>; }
function AuthPage({ mode }: { mode: 'login' | 'signup' | 'forgot' | 'reset' }) { const [authParams] = useSearchParams(); const [state, setState] = useState<{ loading: boolean; error: string; success: string }>({ loading: false, error: googleAuthErrors[authParams.get('auth') || ''] || '', success: '' }); const [fields, setFields] = useState({ name: '', email: '', password: '' }); const title = mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create a learning space' : mode === 'forgot' ? 'Reset your password' : 'Choose a new password'; const submit = async (event: React.FormEvent) => { event.preventDefault(); setState({ loading: true, error: '', success: '' }); if (mode === 'forgot' || mode === 'reset') { setState({ loading: false, error: 'Password reset email is not configured yet. Contact the administrator to enable email delivery.', success: '' }); return; } try { const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(fields) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || 'We could not complete that request.'); setState({ loading: false, error: '', success: mode === 'signup' ? 'Account created. You are now signed in.' : 'Signed in successfully.' }); setTimeout(() => { window.location.href = '/profile'; }, 500); } catch (error) { setState({ loading: false, error: error instanceof Error ? error.message : 'We could not complete that request.', success: '' }); } }; return <section className="auth-page"><div className="auth-visual"><span className="eyebrow">OpenLearn World</span><h1>Learning belongs to everyone.</h1><p>Browse freely. An account is optional. Create one when you want secure progress across devices.</p><div className="auth-quote">“Knowledge should have no borders.”</div></div><form className="auth-card" onSubmit={submit}><Link to="/" className="back-link">← Back home</Link><h2>{title}</h2>{state.error && <div className="form-error" role="alert">{state.error}</div>}{state.success && <div className="success-box" role="status"><Check size={24}/><h3>{state.success}</h3></div>}{!state.success && <>{mode !== 'login' && mode !== 'forgot' && <label>Name<input value={fields.name} onChange={e => setFields({ ...fields, name: e.target.value })} required minLength={2} maxLength={100} placeholder="What should we call you?"/></label>}{mode !== 'forgot' && <label>Email<input value={fields.email} onChange={e => setFields({ ...fields, email: e.target.value })} required type="email" placeholder="you@example.org"/></label>}{mode !== 'forgot' && mode !== 'reset' && <label>Password<input value={fields.password} onChange={e => setFields({ ...fields, password: e.target.value })} required type="password" minLength={8} placeholder="At least 8 characters"/></label>}{mode === 'reset' && <label>New password<input required type="password" minLength={8} placeholder="At least 8 characters"/></label>}<button className="button" type="submit" disabled={state.loading}>{state.loading ? 'Working...' : mode === 'login' ? <><LogIn size={16}/> Sign in</> : mode === 'signup' ? <><UserPlus size={16}/> Create account</> : 'Continue'} <ArrowRight size={16}/></button>{mode === 'login' && <a className="google-button" href="/api/auth/google"><GoogleIcon/> Continue with Google</a>}<small className="auth-note">Email accounts use secure server-side MongoDB sessions. Google sign-in requires OAuth credentials in the server environment.</small><p className="auth-links">{mode === 'login' ? <><Link to="/signup">Create an account</Link> · <Link to="/forgot-password">Forgot password?</Link></> : <Link to="/login">Already have an account? Sign in</Link>}</p></>}</form></section>; }
function Partnerships() { const [localNotice, setLocalNotice] = useState(false); const submit = (event: React.FormEvent<HTMLFormElement>) => { if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') { event.preventDefault(); setLocalNotice(true); } }; return <SimplePage eyebrow="Future partnerships" title="Reach further, together." body="OpenLearn World is designed for conversation with schools, NGOs, community organizations, educators, technology groups, researchers, and responsible sponsors. This inquiry is processed by Netlify Forms after deployment; local previews do not send it."><div className="partner-grid">{['Schools and teachers','NGOs and community groups','Device and connectivity programs','Researchers and institutions'].map((item, i) => <article key={item}><span>0{i + 1}</span><h3>{item}</h3><p>Explore a future pathway for making knowledge more reachable in local contexts.</p></article>)}</div><form className="settings-card inquiry-form" name="partnership" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={submit}><input type="hidden" name="form-name" value="partnership"/><input type="hidden" name="bot-field"/><label>Name<input name="name" required maxLength={100}/></label><label>Organization<input name="organization" required maxLength={120}/></label><label>Email<input name="email" type="email" required maxLength={160}/></label><label>Organization type<select name="organization-type" required><option value="">Choose one</option><option>School</option><option>NGO</option><option>Community organization</option><option>Educational institution</option><option>Technology organization</option><option>Sponsor</option><option>Research organization</option><option>Other</option></select></label><label>Country or region<input name="country" required maxLength={100}/></label><label>Partnership interest<textarea name="interest" required maxLength={500}/></label><label>Message<textarea name="message" required maxLength={2000}/></label><button className="button" type="submit">Explore a partnership <ArrowRight size={16}/></button>{localNotice && <span className="save-note">Local preview only: deploy to Netlify to process this form.</span>}</form></SimplePage>; }
function Settings() { const [saved, setSaved] = useState(false); const [large, setLarge] = useStored('olw-large-text', false); const [reduced, setReduced] = useStored('olw-reduced-motion', false); return <SimplePage eyebrow="Your preferences" title="Make the platform feel like yours." body="These preferences are stored on this device. Cloud account synchronization can be added through the secure MongoDB account layer."><div className="settings-card"><label>Name<input placeholder="Optional learner name"/></label><label>Preferred language<select><option>English</option><option>Bangla</option><option>Spanish</option><option>French</option></select></label><label><input type="checkbox" checked={large} onChange={e => setLarge(e.target.checked)}/> Larger text</label><label><input type="checkbox" checked={reduced} onChange={e => setReduced(e.target.checked)}/> Reduced motion</label><button className="button" onClick={() => setSaved(true)}>Save changes <Check size={16}/></button>{saved && <span className="save-note">Preferences saved locally.</span>}</div></SimplePage>; }
function LegalPage({ kind }: { kind: 'privacy' | 'terms' | 'child-safety' }) { const copy = kind === 'privacy' ? ['Privacy in plain language', 'OpenLearn World only needs information required for a future account and never requires a child to provide a real name to learn. Demo progress, favorites, and accessibility settings remain in local storage. Analytics and advertising are not enabled by this prototype.'] : kind === 'terms' ? ['Terms in plain language', 'This prototype provides educational content for learning and exploration. Content, partner pathways, and impact numbers marked as goals are not guarantees. Production legal terms require review before launch.'] : ['Child safety principles', 'We design for minimal data collection, no public child profiles, no targeted advertising to children, accessible learning, and clear adult/organization partnership channels. This is a design commitment, not a legal certification.']; return <SimplePage eyebrow="Trust and care" title={copy[0]} body={copy[1]}><div className="legal-card"><h3>Legal review required before public launch.</h3><p>Before connecting authentication, analytics, advertising, or partner programs, review data retention, consent, child safety, accessibility, and local legal requirements with qualified counsel.</p><p>Questions about privacy or safety can be raised through the <Link to="/contact">contact page</Link>.</p></div></SimplePage>; }
function Contact() { const [localNotice, setLocalNotice] = useState(false); const submit = (event: React.FormEvent<HTMLFormElement>) => { if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') { event.preventDefault(); setLocalNotice(true); } }; return <section className="page-section contact-page"><SectionHeading eyebrow="Start a conversation" title="Help knowledge travel further." body="Contact is configured for Netlify Forms after deployment. The local preview never claims that an email was sent."/><div className="contact-grid"><form name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={submit}><input type="hidden" name="form-name" value="contact"/><input type="hidden" name="bot-field"/><label>Name<input name="name" required maxLength={100} placeholder="No real name needed"/></label><label>Email<input name="email" type="email" required maxLength={160} placeholder="you@example.org"/></label><label>Organization<input name="organization" maxLength={120}/></label><label>Country<input name="country" required maxLength={100} placeholder="Where are you learning from?"/></label><label>Reason<select name="reason" required><option value="">Choose one</option><option>General</option><option>Schools</option><option>Partnerships</option><option>Technical</option><option>Feedback</option></select></label><label>Message<textarea name="message" required maxLength={2000} rows={5} placeholder="Tell us what you are thinking..."></textarea></label><button className="button" type="submit">Submit inquiry <ArrowRight size={16}/></button>{localNotice && <span className="save-note">Local preview only: deploy to Netlify to process this form.</span>}</form><aside className="contact-note"><ShieldCheck size={27}/><h3>Child-safe by default</h3><p>Children do not need an account, real name, or public profile to learn here. We do not design for behavioral tracking or targeted advertising to children.</p></aside></div></section>; }
function Profile() { const [progress, setProgress] = useStored<Record<string, { complete: boolean; score: number }>>('olw-lesson-progress', {}); const [user, setUser] = useState<{ name: string; email: string; provider: string } | null>(null); const completed = Object.values(progress).filter(p => p.complete).length; const reset = () => { setProgress({}); localStorage.removeItem('olw-favorites'); }; useEffect(() => { fetch('/api/auth/me', { credentials: 'include' }).then(response => response.json()).then(data => setUser(data.user)).catch(() => setUser(null)); }, []); const logout = async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); window.location.href = '/login'; }; return <section className="page-section profile-page"><SectionHeading eyebrow="Your private progress" title={user ? `${user.name}'s learning journey.` : 'Your learning journey starts here.'} body={user ? `Signed in with ${user.provider}. Your account identity is private.` : 'No account is currently signed in. This dashboard stays on your device.'}/><div className="profile-summary"><div className="profile-avatar">{user ? user.name.charAt(0).toUpperCase() : 'L'}</div><div><span className="eyebrow">{user ? 'Signed-in learner' : 'Guest learner'}</span><h2>{user?.name || 'Curious learner'}</h2><p>{user?.email || 'Keep exploring at your own pace.'}</p></div>{user ? <button className="button button-secondary" onClick={logout}>Log out</button> : <Link className="button button-secondary" to="/login">Sign in</Link>}</div><div className="profile-stats"><div><Trophy size={20}/><strong>{completed}</strong><span>Completed lessons</span></div><div><Sparkles size={20}/><strong>{completed * 100}</strong><span>Knowledge points</span></div><div><Languages size={20}/><strong>0</strong><span>Words practiced</span></div><div><Zap size={20}/><strong>{completed ? 1 : 0}</strong><span>Learning streak</span></div></div><h2 className="subsection-title">Achievements</h2><div className="achievement-grid">{achievements.map((name, i) => <div className={i < completed ? 'achievement earned' : 'achievement'} key={name}><span>{i < completed ? <Check size={18}/> : <Trophy size={18}/>}</span><b>{name}</b><small>{i < completed ? 'Earned' : 'Keep learning'}</small></div>)}</div><button className="button button-secondary" onClick={reset}>Reset learning progress</button></section>; }
function AuthCallback() { const [params] = useSearchParams(); const [state, setState] = useState('Completing sign-in...'); useEffect(() => { const error = params.get('error'); setState(error ? 'Sign-in was not completed. Please return to the login page and try again.' : 'Your sign-in response was received.'); if (!error) setTimeout(() => { window.location.href = '/profile'; }, 600); }, [params]); return <section className="auth-page"><div className="auth-visual"><span className="eyebrow">OpenLearn World</span><h1>One more step.</h1><p>{state}</p></div><div className="auth-card"><h2>{state}</h2><Link className="button" to="/login">Return to sign in <ArrowRight size={16}/></Link></div></section>; }
function SearchPage() { return <Learn/>; }
export function App() { return <Routes><Route element={<Layout><Home/></Layout>} path="/"/><Route element={<Layout><Learn/></Layout>} path="/learn"/><Route element={<Layout><Subjects/></Layout>} path="/subjects"/><Route element={<Layout><LessonPage/></Layout>} path="/learn/lesson/:id"/><Route element={<Layout><LessonPage/></Layout>} path="/lesson/:id"/><Route element={<Layout><Learn/></Layout>} path="/learn/:subject"/><Route element={<Layout><Translate/></Layout>} path="/translate"/><Route element={<Layout><Offline/></Layout>} path="/offline"/><Route element={<Layout><Books/></Layout>} path="/books"/><Route element={<Layout><Impact/></Layout>} path="/impact"/><Route element={<Layout><About/></Layout>} path="/about"/><Route element={<Layout><Partnerships/></Layout>} path="/partnerships"/><Route element={<Layout><FAQ/></Layout>} path="/faq"/><Route element={<Layout><Contact/></Layout>} path="/contact"/><Route element={<Layout><Profile/></Layout>} path="/profile"/><Route element={<Layout><Settings/></Layout>} path="/settings"/><Route element={<Layout><LegalPage kind="privacy"/></Layout>} path="/privacy"/><Route element={<Layout><LegalPage kind="terms"/></Layout>} path="/terms"/><Route element={<Layout><LegalPage kind="child-safety"/></Layout>} path="/child-safety"/><Route element={<AuthPage mode="login"/>} path="/login"/><Route element={<AuthPage mode="signup"/>} path="/signup"/><Route element={<AuthPage mode="forgot"/>} path="/forgot-password"/><Route element={<AuthPage mode="reset"/>} path="/reset-password"/><Route element={<Layout><SearchPage/></Layout>} path="/search"/><Route element={<Layout><EmptyState title="This page wandered somewhere else." body="Use the navigation to find another part of OpenLearn World."/></Layout>} path="*"/></Routes>; }
