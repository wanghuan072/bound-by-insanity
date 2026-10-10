<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Bound By Insanity project rules

- All artifacts stay in this project. Do not read or reuse other game projects. Preserve the existing Next.js App Router architecture and unrelated user files. Read the applicable local framework documentation before implementation.
- Follow the Game-Agent workflow for applicable changes; the latest user-approved scope supersedes its generic multi-game requirements.
- Public pages are exactly Home `/`, Characters `/characters`, Endings `/endings`, Privacy `/privacy`, Terms `/terms`, Copyright `/copyright`, About `/about` and Contact `/contact`. Main navigation is Home → Characters → Endings, shared by desktop, mobile and Footer. Do not restore Guides, More Games, extra-game details or other-game recommendations.
- Main game owns the homepage only. Game facts and the sole player.iframeSrc live in data/games/main-game.json. Two topics use their independent JSON, covers and content. Never substitute another identity or placeholder. No Guide or additional-game data collection is active.
- Preserve researched player-focused copy, spoiler policies, independently indexed body and media. Main body requires 4000 non-whitespace visible characters, its own cover, three explanatory captures and an approved post-body YouTube video. Internal claims, observations, blueprints and media rights stay private. Historical removed-content records in reports/archive are not active build inputs.
- Latest display preference: all article sections render directly, with no click-to-expand spoiler content. Show a spoiler notice at most once per page; keep major revelations out of cards, introductions, metadata and alt text.
- Player starts with visible, focusable Play Now and zero frames. Safe start creates exactly one configured iframe; unsafe configuration fails without a frame. Preserve timeout, retry, cleanup and two distinct fullscreen SVGs. Main first-version status may remain provisional; never claim full playability from load alone. Sandbox forbids popups and top navigation.
- YouTube uses direct lazy youtube-nocookie.com iframe after the body without autoplay or a click-to-create layer. Privacy describes third-party loading. Public copy exposes no research, evidence IDs, collection language or third-party anchors.
- Use local /images/logo.png and uniform /images/og-image.png; preserve actual ratios and contain unless crop safety is verified. No unrelated stock backgrounds, fabricated authors, publisher, company, jurisdiction or dates.
- H1 retains the full main game name, restrained responsive size and original punctuation; no forced uppercase. Free requires verification. All eight pages’ TDK literals, including the homepage, live exclusively in seo/tdk.js per the latest user instruction; main JSON contains game facts and player configuration only. Titles are 40–60 characters, descriptions 140–160. Canonical uses the configured HTTPS Origin. Sitemap includes exactly current pages once; unchanged visible fingerprints preserve dates.
- Maximum container width 1400px; only width breakpoints 1024px and 768px. Hamburger at <=1024, main-game two columns retained. Sidebar follows actual Header offset and parent bottom, with height-aware bidirectional behavior and no internal scroll. At <=768 use document flow. Player, body and video share the full left-column width. Reuse existing classes.
- Footer Legal links are same-tab root URLs with rel="noopener noreferrer nofollow". Contact displays plain-text support@boundbyinsanity.org only, no form or mailto. Footer ends with the current-year copyright line and the shared independent fan-site disclaimer. Legal and planning/site-capabilities.json describe enabled/observed features only.
- Validate actual route inventory before generation/publication. Unexpected public pages must fail, not be silently generated or recursively deleted. Use isolated Playwright contexts; preserve user browser sessions and existing services. Test native navigation lifecycle, development and current-build production pages, runtime errors, CSP and key resources. Production CSP must omit unsafe-eval.
- Run applicable formatting, type, lint, tests and production build checks. Record real build ID, process/PID/readiness/log/stop lifecycle, runtime evidence and current Mobile/Desktop Lighthouse. Keep prior records historical, never represent old packages or scores as current acceptance.
- Website README is English player-facing copy with all Header/Footer page links; deployment/check commands belong in internal reports.
- Default: no deployment, Git commit, push or remote/GitHub mutation.
