The Data Journal — Kartik Padmanabhan
A portfolio typeset like a broadsheet newspaper. Cream paper, ink, one vermillion
accent, a ticker tape, feature articles, and a Wire section that is live from
GitHub — your repos, languages and pushes are fetched on every visit, straight
from the public GitHub API. No token, no login, no build step.

Concept: editorial print. It shares nothing with a typical dark/gradient/particles
portfolio — no dark background, no glassmorphism, no particles, no gradients
(the only gradient in the CSS is the skeleton-loader shimmer), no cursor gimmicks.

Files
File
What it is
index.html	The page — every editable spot has an EDIT comment
style.css	The design system (palette in :root, night edition in html[data-edition="night"])
script.js	Ticker, reveals, night edition, the live GitHub Wire, letters
README.md	This file

Deploy on GitHub Pages
Create a new repository (or reuse the old one after deleting its files), e.g. journal.
Put these 4 files in the repo root (script.js and style.css next to index.html).
Repo → Settings → Pages → Source: main branch, / (root) → Save.
Your site goes live at https://kartik-git95.github.io/journal/ in a minute or two.
To replace your current site, you can also just delete the contents of
kartikpadmanabhan_portfolio and drop these files in — the URL stays the same.

The GitHub "plug-in" (the Wire section)
Open script.js. At the very top:

js
githubUser: 'Kartik-git95',   // ← your username
That is the whole integration. On every visit the page calls:

https://api.github.com/users/Kartik-git95 — repo count, member since
https://api.github.com/users/Kartik-git95/repos?per_page=100&sort=pushed — repos, languages, stars, last push
and typesets the results as "wire briefs" plus a language distribution chart.
Public data only, so no token is needed or should ever be added. Unauthenticated
GitHub API allows 60 requests per visitor IP per hour — far beyond what a portfolio
needs. If the API is unreachable (offline preview, rate limit), the page prints the
fallbackRepos archive instead, so the section is never empty.

Customization cheat sheet
What
Where
Email	script.js → CONFIG.email and the #copyEmail button text in index.html
GitHub username	script.js → CONFIG.githubUser
Ticker items	script.js → CONFIG.ticker
Volume / issue no.	Masthead in index.html + CONFIG.volume
Skills & levels	Section № 02 in index.html — add/remove <span class="sq on"> (max 5)
Tool chips	№ 02 → .chips list
Projects (articles)	Section № 03 — each <article> has kicker, title+link, deck, copy, tags
LinkedIn / socials	№ 05 — an EDIT comment shows where to uncomment links
Fallback repo data	script.js → CONFIG.fallbackRepos
Colors	style.css → :root (day) and html[data-edition="night"] (night)

Details worth knowing
Night Edition — the masthead button inverts the whole paper to ink; the choice
is remembered in localStorage (kp-journal-edition).
Ticker — pure CSS animation, pauses on hover, items come from CONFIG.ticker.
Letters to the editor — the contact form composes a mailto: and opens the
visitor's mail app. Nothing is stored, nothing is sent to a server.
Counters, reveals — IntersectionObserver; all motion respects
prefers-reduced-motion.
Print — the page keeps a print stylesheet; it is a newspaper, after all.
Fonts load from Google Fonts (Fraunces + IBM Plex Mono). If you prefer
self-hosting, download the woff2 files and change the <link> in index.html.
