# Current implementation map

Preserve Next.js 16.4.0 App Router, React 19.3.0, npm, TypeScript and the current src/page and src/components architecture. Framework-specific work follows bundled Next documentation.

Thin app/page.tsx, characters/page.tsx and endings/page.tsx delegate to HomeRoute, CharactersRoute and EndingsRoute. The five root Legal wrappers share LegalPage. app/robots.ts, app/sitemap.ts and app/not-found.tsx are framework endpoints. No guide or extra-game route is generated. src/lib/site-scope.mjs verifies the approved eight-page collection before publication.

main-game.json is the sole game configuration and preserves the user’s player.iframeSrc. Topic JSON contains the independent article blocks and covers; data/legal/pages.json contains the five policy pages. seo/tdk.js owns static metadata and imports main-game SEO for the homepage. Runtime loaders, snapshots, JSON-LD and sitemap resolve only this collection. No Guide model, TOC component, empty games catalogue or Guide images remain in runtime/public data.

The generator validates planning navigation and route registry before creating only the three owned content wrappers. It performs no recursive Guide-directory deletion. Unknown or reintroduced routes fail the publishing gate rather than entering a package silently.

The local draft-preview wrapper is owned, temporary and noindex; production build removes it. Production uses .next-production standalone output, copies public and static assets into artifacts/production and audits internal-file leakage. Production CSP derives the configured safe main-game origin and approved privacy-enhanced YouTube origin. Development eval remains local-only.
