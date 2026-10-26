# OurTings — handoff context

Read README.md first (features, setup, commands). This file records decisions and status.

## Decisions
- PWA (user wrote "RWA"): Vite + React 19 + TS, `vite-plugin-pwa` autoUpdate. Single page, no router (no SPA rewrite needed).
- Backend: Firebase Firestore (Spark/free), chosen over Supabase (pauses idle free projects) and Neon (no realtime, needs API code). Whole `events` collection is subscribed; fine for two people's data.
- Access: user wanted no login. Compromise approved by user: one shared Firebase email/password account (`ourtings@noratikachung.com`); its password is the "secret code", entered once per device. `firestore.rules` admit only that email (any other signed-up account is rejected). The Nora/Anant choice is local only (`localStorage`), used for event ownership, comments and filters.
- Times are floating local strings `yyyy-MM-ddTHH:mm` (both users share a timezone). All-day events span whole days through their end date. Birthdays repeat yearly from the birth year; 29 Feb → 28 Feb in non-leap years. Week starts Monday (`WEEK_STARTS_ON`).
- Event owner = creator (whose calendar it's on). Anyone may edit/delete/comment.
- Device prefs (`localStorage`): `ourtings:user`, `ourtings:theme`, `ourtings:prefs:<user>` = { visible, view }.
- Art: original SVG in `src/art/` (Avatar, Scenery, WelcomeScene scenery, DialogOrnament). Welcome Hornet/Knight = official pictures from the user (`assets/characters/`), trimmed + mirrored to face each other in `src/art/welcome/`. App icon = user's transparent bunny (`assets/icons/app-icon-bunny.png`) → `public/icon.png` (square, transparent) → `npm run icons`: black background for apple-touch and maskable (iOS can't show transparency; it would render black anyway), transparent for browser/desktop icons. Light theme = Studio Ghibli style (Nora = little white Totoro, Anant = big Totoro). Dark theme = Hollow Knight style (Nora = Hornet, Anant = Knight) and is the first-open default.
- CI mirrors `pdf-tools`: GitHub Actions verify; Vercel native Git integration deploys. Firestore rules are deployed manually (README step 1.5).
- Firestore emulator port is 8085 (8080 is used by WSL relay on the dev machine).
- Welcome (`src/components/Welcome.tsx`, art in `src/art/WelcomeScene.tsx`): shown on every browser-tab visit, never when installed (`isInstalled()` = display-mode standalone or `navigator.standalone`). Butterfly tap calls `requestInstall()` (saved `beforeinstallprompt`, Chromium only) and reveals page 2; iOS has no install API, so page 2 shows Share → Add to Home Screen. Hornet whispers only a hint, never the code (the page is public). Tiny × = skip to the app.

## Status
- Phase 1 implemented: device code gate, user picker, logout, day/week/month/year views, per-user filters + saved view, events with place/notes/all-day, birthdays, comments, light/dark theme, offline cache, PWA icons/manifest.
- GitHub: `main` pushed to https://github.com/NoratikaChung/OurTings (first commit `3a96f8c`). Not done (user-controlled): Firebase project creation, Vercel project/env vars, domain DNS.
- Phase 2 (planned, not started): Malaysia public holidays + Hindu events feeds; push notifications for new events.
- Fixed: first GitHub Actions run (40322341706) failed the 4 "two devices" e2e tests. Cause was an app bug, not CI: the month view's selected-day list filtered by the current time of day, so events that had already ended today were hidden (CI ran at 12:29 UTC, after the 10:00 test event; local runs were at ~4 AM). Fix: `startOfDay(cursor)` in `MonthView.tsx`. The e2e test now fixes the browser clock at 15:00 so it always covers that case (verified it fails without the fix).

## Verification (2026-10-26, local)
- `npm run lint`, `npm run typecheck`, `npm test` (6 unit tests), `npm run build` (PWA: sw.js + manifest, 35 precached files), `npm audit --omit=dev --audit-level=high` (0, after `@grpc/grpc-js` override for Firestore's Node-only build): all pass.
- `npm run test:e2e` against Firebase emulators: 16/16 pass across iPhone 14 Pro Max (WebKit), iPad Pro 12.9" (WebKit), Galaxy Tab (Chromium), laptop 1440×900 (Chromium): wrong code stays locked; two devices sync events + comments live; filters/view/theme/user/unlock survive reload; logout returns to picker without the code; edit + delete; rules reject anonymous and non-household accounts.
- Visual check of seeded data on the same devices, both themes (gate, picker, day/week/month/year, detail, editor). Fixed during this pass: user menu hidden under toolbar, iPhone editor overflow, year grid overflow, sticky hover on touch.
- Not verified: real iOS/iPadOS hardware, Home Screen install, real Firebase project, Vercel deploy, GitHub Actions run.
