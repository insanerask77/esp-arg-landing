# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page landing site (in Spanish) for the España vs Argentina World Cup 2026 final, built to
drive traffic, retain visitors with mini-games, and monetize via ads (Google AdSense / Monetag) whose
revenue is raffled off to participants via an Instagram giveaway. Frontend is HTML + CSS + vanilla
JS — **no frontend framework, no build step, no package.json**. GSAP + ScrollTrigger are loaded from
a CDN with a deferred/no-CDN fallback. There's now a small Python backend (stdlib only — no pip
install needed) for shared data (comments, "who's going to win" votes) — see below.

## Running / developing

Run `python3 server/app.py` (optionally `PORT=8000 python3 server/app.py`) from the repo root, then
visit `http://localhost:8000/`. The server serves the static files (`index.html`, `css/`, `js/`,
`img/`) **and** the JSON API from one process — there is no separate frontend dev server.

**Must run `server/app.py` specifically — not the generic `python3 -m http.server`.** The generic
module only serves static files; it has no `/api/comments` or `/api/vote` routes and no `do_POST` at
all, so any POST to those paths 501s and the frontend shows its generic "no se pudo guardar" error.
If this is fronted by a reverse proxy/tunnel (e.g. Cloudflare), make sure it points at the port
`server/app.py` is actually listening on (`PORT` env var, default 8000), not at a bare static-file
server. Opening `index.html` directly as a `file://` URL still works for everything except comments
and voting, which need the API. There are no tests, linters, or package manifests — the backend uses
only Python's standard library (`http.server`, `sqlite3`), so nothing needs to be `pip install`ed.

The SQLite file is created at `server/data.db` on first run (gitignored). Delete it to reset all
comments/votes.

Cache-busting: `index.html` references `css/style.css?v=5` and `js/main.js?v=5`. When editing either
file, bump the `?v=` query param on its `<link>`/`<script>` tag in `index.html` so browsers/CDNs pick
up the change.

## Architecture

- `index.html` — everything lives here: SEO meta tags, JSON-LD structured data (`SportsEvent` +
  `FAQPage`), Open Graph/Twitter cards, ad network scripts (Monetag zones + commented AdSense
  instructions), and the full page markup (hero, countdown, prediction game, penalty mini-game,
  trivia, Instagram giveaway section, "previa" SEO content, comments). All visible content is in the
  raw HTML (not injected by JS) so it indexes without requiring Googlebot to execute JavaScript.
- `js/main.js` — all interactivity, in one file, organized by feature in top-to-bottom sections:
  countdown timer, estimated prize pot ticker, "who's going to win" vote (backed by the API), penalty
  shootout game (with GSAP choreography, localStorage only), trivia quiz, comments (backed by the
  API), scroll progress bar, and GSAP/ScrollTrigger entrance/scroll animations (with a plain
  `IntersectionObserver` fallback when GSAP/CDN is unavailable or `prefers-reduced-motion` is set).
- `css/style.css` — one stylesheet, sectioned with `/* ===== Section ===== */` comments matching the
  HTML sections (Hero, Countdown, Cards, Ads, Voto, Penaltis, Trivia, Sorteo, Previa, etc.).
- `server/app.py` — the backend: a `ThreadingHTTPServer` subclassing `SimpleHTTPRequestHandler` so it
  serves static files by default, intercepting `GET`/`POST` on `/api/comments` and `/api/vote`
  before falling through to static serving. Uses a fresh `sqlite3` connection per request (traffic is
  low, so this trades a little performance for simplicity/correctness — no connection pooling or
  threading edge cases to worry about).
- Mixed persistence: **comments and the win-vote** live server-side in `server/data.db` (SQLite),
  shared across all visitors. Everything else — penalty-game streak/best score, quiz best score, the
  estimated pot counter, the `clientId` used to identify "your" vote — stays in `localStorage`
  only, via the `store` helper object near the top of `main.js`. There are no user accounts or auth;
  the anonymous `clientId` (a random string persisted in localStorage) is just how the backend knows
  which vote row to update on re-submission instead of creating a duplicate.

### Key domain concepts

- **Estimated pot counter** (`POT` object in `main.js`): a deterministic, time-based estimate of ad
  revenue shown to all visitors identically — it's `BASE + hours_since_LAUNCH * RATE_PER_HOUR +
  clicks * CLICK_BONUS`, not a real revenue feed. Tune `RATE_PER_HOUR`/`BASE`/`LAUNCH` to match actual
  Monetag earnings; `CLICK_BONUS` increments via `potClicks` in localStorage when a visitor clicks a
  `.btn-cta`. (There used to be a Monetag "direct link" ad popup on `.btn-cta` clicks — it was removed;
  `.btn-cta` buttons are now plain links/anchors again.)
  The displayed value is always formatted to at most 2 decimals with no filler zeros (`Intl.NumberFormat`
  with `maximumFractionDigits: 2`).
- **Score prediction / fan-vote percentage**: `POST /api/predictions {clientId, esp, arg}` upserts a
  row per `clientId` (one vote per browser, not per submission) into `server/data.db`, then returns
  the recalculated split — `esp > arg` counts as a España win-vote, `arg > esp` as an Argentina
  win-vote, `esp === arg` as a tie — as `espPct`/`argPct`/`tiePct` out of `total`. `GET
  /api/predictions?clientId=...` returns the same `stats` plus `mine` (that client's saved
  prediction, if any) so the form can restore state and the "voto de la afición" line
  (`#predict-stats`) can render on load without needing to submit first.
- **Instagram giveaway**: entry happens entirely off-site on Instagram (like + comment tagging 2
  friends); the site only explains rules and links out via `#insta-post-link`. This is *not* a paid
  betting product — predictions/games are explicitly free with no real-money wagering (this is called
  out repeatedly in the copy and FAQ for legal/compliance reasons — preserve that framing when editing
  copy).
- **Motion gating**: `motionOK()` in `main.js` checks both that GSAP loaded (CDN may be blocked) and
  `prefers-reduced-motion`. Any new animation should route through this check the same way existing
  animations do, and have a non-GSAP fallback path where reasonable.
- Ad placeholders (`.ad-placeholder`) mark where AdSense/Monetag ad units get pasted in; there are
  three slots (top, mid, bottom) plus the Monetag scripts/service workers (`sw.js`, `sw3.js` at repo
  root, referenced by zone ID) already wired into `<head>`.

## Editing conventions specific to this repo

- Site copy is in Spanish; keep new user-facing text in Spanish and consistent in tone with existing
  copy (informal, exclamation-heavy, emoji-prefixed section headers).
- The real domain is `esp-arg.madolell.com` — used in `index.html` canonical/OG tags, `robots.txt`, and
  `sitemap.xml`. Keep these three in sync if the domain ever changes.
- This is an unofficial fan page — do not add official FIFA/RFEF/AFA logos or branding; the legal
  disclaimers in the footer and FAQ exist for a reason and should be preserved when restructuring
  content.
