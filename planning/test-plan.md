# Current verification plan

Run npm run validate:publish, npm run validate:media, npm run content:verify, npm run format:check, npm run lint, npm run typecheck, npm run test and npm run build. Scope tests reject reintroduced Guide or additional-game routes and prove publication succeeds after their data/media files are absent. Date tests retain unchanged page dates and update visible card parents only when content changes.

Use isolated Playwright contexts on the current source development service and an owned standalone production preview with the new build ID. Check all eight pages at widths 1464, 1024 and 768, plus negative /guides, /guides/reading-controls, /games, /games/bound-by-insanity and an unknown game. Inspect metadata, schema, sitemap, shared navigation, menu behavior, resources, exceptions, CSP, image identity, horizontal overflow and screenshots. Real scrolling checks sidebar Header and parent-bottom boundaries; 768 is ordinary flow.

Player initial state has a visible Play Now button and zero game frames. Start creates exactly one frame with the current configured src. Test fullscreen controls, timeout/removal/retry and native navigation cleanup with ready state after returning. Main runtime remains provisional; do not describe iframe load as verified gameplay.

Measure Mobile and Desktop Lighthouse on the same production build; record raw reports, build identity, LCP, CLS, TBT and performance. Repeat three times if results fluctuate. Preserve actual service PID, port, readiness, logs and exit/stop details. Do not deploy or commit Git.
