/* ═══════════════════════════════════════════════════════════════
   THE DATA JOURNAL — script.js
   Sections: CONFIG · date · ticker · minibar · reveals · counters ·
             night edition · THE WIRE (live GitHub) · classifieds
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   CONFIG — everything you may want to change lives here
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  // The GitHub "plug-in": set your username and the Wire section
  // fetches your real repos, languages and pushes on every visit.
  githubUser: 'Kartik-git95',

  // EDIT: your contact email (used by the copy button and the letter form)
  email: 'kartik@example.com',

  // EDIT: override the ticker items if your stack changes
  ticker: ['PYTHON', 'SQL', 'XGBOOST', 'SHAP', 'YOLOV8', 'CSRNET',
           'PANDAS', 'SCIKIT-LEARN', 'OPENCV', 'JUPYTER', 'MYSQL', 'JAVASCRIPT'],

  // Edition label printed in the masthead
  volume: 'Vol. II',
  issue: 26,

  // Fallback wire items — shown only if the GitHub API cannot be
  // reached (offline preview, rate limit). Edit when repos change.
  fallbackRepos: [
    { name: 'customer_churn', desc: 'Churn prediction with XGBoost + SHAP explainability on the IBM Telco dataset', language: 'Jupyter Notebook', stars: 0, pushed_at: '2026-07-19', homepage: '' },
    { name: 'kartikpadmanabhan_portfolio', desc: 'Source of the previous issue of this journal', language: 'JavaScript', stars: 0, pushed_at: '2026-11-11', homepage: '' },
    { name: 'DBMS-PROJECT', desc: 'noteXchange — a sample website for selling and buying online notes', language: 'HTML', stars: 0, pushed_at: '2025-10-21', homepage: '' },
    { name: 'DATA-ANALYTICS-PROJECT', desc: 'Data analytics project', language: 'Python', stars: 0, pushed_at: '2025-10-06', homepage: '' },
    { name: 'Verifai', desc: 'AI verification experiments', language: 'Python', stars: 0, pushed_at: '2025-09-20', homepage: '' },
    { name: 'WaveGuard-Kallakkadal-Predictor', desc: 'Early-warning predictor for Kallakkadal sudden-onset swell waves', language: 'JavaScript', stars: 0, pushed_at: '2025-08-24', homepage: '' },
  ],
  fallbackStats: { publicRepos: 6, stars: 0, since: 'JUL 2025', lastPush: 'JUL 2026' },
};

/* ─────────────── helpers ─────────────── */
const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ─────────────── masthead date ─────────────── */
(function printDate() {
  const now = new Date();
  const long = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const short = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  $$('.js-date').forEach(el => el.textContent = long);
  $$('.js-date-short').forEach(el => el.textContent = short);
  $$('.js-year').forEach(el => el.textContent = now.getFullYear());
})();

/* ─────────────── ticker ───────────────
   The CSS animation translates the track by -50%, so we render
   the item list twice for a seamless loop. */
(function buildTicker() {
  const track = $('#tickerTrack');
  if (!track) return;
  const items = CONFIG.ticker;
  const sep = '<span class="ticker-sep">◆</span>';
  const half = items.map(t => `<span class="ticker-item">${t}</span>`).join(sep);
  track.innerHTML = half + sep + half + sep;
})();

/* ─────────────── sticky mini bar ─────────────── */
(function miniBar() {
  const bar = $('#minibar');
  if (!bar) return;
  const masthead = $('.masthead');
  const onScroll = () => {
    const past = masthead.getBoundingClientRect().bottom < 0;
    bar.classList.toggle('stuck', past);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─────────────── reveal on scroll ─────────────── */
(function reveals() {
  const els = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('printed'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('printed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
})();

/* ─────────────── counters ─────────────── */
(function counters() {
  const nums = $$('.stat-num');
  const run = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const pad = parseInt(el.dataset.pad, 10) || 0;
    if (reducedMotion) { el.textContent = String(target).padStart(pad, '0'); return; }
    const dur = 900;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased)).padStart(pad, '0');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
})();

/* ─────────────── night edition ─────────────── */
(function edition() {
  const KEY = 'kp-journal-edition';
  const btn = $('#editionToggle');
  const root = document.documentElement;
  const apply = (mode) => {
    if (mode === 'night') root.setAttribute('data-edition', 'night');
    else root.removeAttribute('data-edition');
    if (btn) {
      const label = $('.edition-label', btn);
      if (label) label.textContent = mode === 'night' ? 'DAY EDITION' : 'NIGHT EDITION';
    }
  };
  let mode = 'day';
  try { mode = localStorage.getItem(KEY) || 'day'; } catch (e) { /* private mode */ }
  apply(mode);
  if (btn) btn.addEventListener('click', () => {
    mode = mode === 'night' ? 'day' : 'night';
    try { localStorage.setItem(KEY, mode); } catch (e) { /* ignore */ }
    apply(mode);
    toast(mode === 'night' ? 'NIGHT EDITION — ink on ink' : 'DAY EDITION — ink on paper');
  });
})();

/* ═════════════════════════════════════════════════
   THE WIRE — live from GitHub (public API, no token)
   ═════════════════════════════════════════════════ */
(async function theWire() {
  const briefsEl = $('#wireBriefs');
  if (!briefsEl) return;

  const user = CONFIG.githubUser;
  const API = 'https://api.github.com';

  const fmtDate = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const briefHTML = (r, isPortfolio) => `
    <div class="brief${isPortfolio ? ' is-port' : ''}">
      <div class="brief-top">
        <a href="https://github.com/${esc(user)}/${esc(r.name)}" target="_blank" rel="noopener">
          <span class="brief-name">${esc(r.name)}</span>
        </a>
        <span class="brief-date">${fmtDate(r.pushed_at || r.updated_at)}</span>
      </div>
      <p class="brief-desc">${r.desc ? esc(r.desc) : '<em>Filed without a summary.</em>'}</p>
      <div class="brief-meta">
        ${r.language ? `<span><span class="dot"></span>${esc(r.language)}</span>` : '<span>—</span>'}
        <span>★ ${r.stargazers_count != null ? r.stargazers_count : (r.stars || 0)}</span>
        ${r.homepage ? `<span><a href="${esc(r.homepage)}" target="_blank" rel="noopener">LIVE ↗</a></span>` : ''}
      </div>
    </div>`;

  const fillStats = (s) => {
    $('#wsRepos').textContent = String(s.publicRepos).padStart(2, '0');
    $('#wsStars').textContent = String(s.stars).padStart(2, '0');
    $('#wsLangs').textContent = String(s.languages).padStart(2, '0');
    $('#wsSince').textContent = s.since;
    $('#wsPush').textContent = s.lastPush;
  };

  const fillLangs = (counts) => {
    const wrap = $('#langBars');
    if (!wrap) return;
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = entries.length ? entries[0][1] : 1;
    wrap.innerHTML = entries.map(([name, n], i) => `
      <div class="lang-row">
        <span class="lang-name">${esc(name)}</span>
        <span class="lang-track"><span class="lang-fill${i === 0 ? ' hi' : ''}" data-w="${(n / max) * 100}"></span></span>
        <span class="lang-count">${n} repo${n === 1 ? '' : 's'}</span>
      </div>`).join('');
    requestAnimationFrame(() => {
      setTimeout(() => $$('.lang-fill', wrap).forEach(f => {
        f.style.width = f.dataset.w + '%';
      }), 60);
    });
  };

  const render = (repos, stats, live) => {
    // sort: most recently pushed first; portfolio repo flagged separately
    const sorted = [...repos].sort((a, b) =>
      new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));
    const portName = `${CONFIG.githubUser.toLowerCase().replace(/-/g, '')}portfolio`;
    briefsEl.innerHTML = sorted.map(r =>
      briefHTML(r, (r.name || '').toLowerCase().includes('portfolio'))).join('');
    fillStats(stats);
    if (live) $('#wireFootnote').textContent =
      `FILED ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} — LIVE FROM api.github.com`;
  };

  try {
    const [uRes, rRes] = await Promise.all([
      fetch(`${API}/users/${encodeURIComponent(user)}`, { headers: { 'Accept': 'application/vnd.github+json' } }),
      fetch(`${API}/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`, { headers: { 'Accept': 'application/vnd.github+json' } }),
    ]);
    if (!uRes.ok || !rRes.ok) throw new Error('API unavailable');
    const profile = await uRes.json();
    const repos = await rRes.json();
    if (!Array.isArray(repos)) throw new Error('Unexpected payload');

    const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const langs = {};
    repos.forEach(r => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
    const lastPush = repos.length
      ? new Date(repos[0].pushed_at || repos[0].updated_at)
          .toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()
      : '—';

    render(repos, {
      publicRepos: profile.public_repos != null ? profile.public_repos : repos.length,
      stars,
      languages: Object.keys(langs).length,
      since: new Date(profile.created_at || Date.now())
        .toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase(),
      lastPush,
    }, true);
    fillLangs(langs);
  } catch (err) {
    // Offline / rate-limited: print the fallback edition
    const counts = {};
    CONFIG.fallbackRepos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    render(CONFIG.fallbackRepos, {
      publicRepos: CONFIG.fallbackStats.publicRepos,
      stars: CONFIG.fallbackStats.stars,
      languages: Object.keys(counts).length,
      since: CONFIG.fallbackStats.since,
      lastPush: CONFIG.fallbackStats.lastPush,
    }, false);
    fillLangs(counts);
    $('#wireFootnote').textContent = 'FILED FROM THE ARCHIVE — GitHub unreachable, showing the last edition';
  }
})();

/* ─────────────── classifieds: copy email ─────────────── */
(function copyEmail() {
  const btn = $('#copyEmail');
  if (!btn) return;
  const label = $('.ad-cta-email', btn);
  if (label) label.textContent = `REPLY: ${CONFIG.email}`;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.email);
      toast('ADDRESS COPIED TO CLIPBOARD');
    } catch (e) {
      // very old browsers
      const ta = document.createElement('textarea');
      ta.value = CONFIG.email;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('ADDRESS COPIED TO CLIPBOARD'); }
      catch (e2) { toast(CONFIG.email); }
      ta.remove();
    }
  });
})();

/* ─────────────── letters to the editor (mailto composer) ─────────────── */
(function letterForm() {
  const send = $('#letterSend');
  if (!send) return;
  send.addEventListener('click', () => {
    const name = ($('#letterName') || {}).value || '';
    const topic = ($('#letterTopic') || {}).value || '';
    const body = ($('#letterBody') || {}).value || '';
    const subject = topic
      ? `Letter to the editor: ${topic}`
      : 'Letter to the editor';
    const sig = body + (body.endsWith('\n') || !body ? '' : '\n') + '\n— ' + (name || 'a reader');
    const url = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(sig)}`;
    if (!body && !name && !topic) {
      toast('WRITE A FEW WORDS FIRST — THE EDITOR READS EVERYTHING');
      $('#letterBody').focus();
      return;
    }
    window.location.href = url;
    toast('OPENING YOUR MAIL APPLICATION…');
  });
})();
