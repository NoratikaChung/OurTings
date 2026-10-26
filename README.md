# OurTings

Private shared calendar for Nora and Anant. Installable web app (PWA) for iPhone, iPad, Android tablet and laptop.

- Unlock each device once with a shared secret code, then tap your icon (cat/Hornet = Nora, bunny/Knight = Anant). You stay that user until **Log out**.
- Day / week / month / year views. Show or hide each person's calendar; the toggles and last view are remembered per user on each device.
- Events (name, notes, place, date & time, all-day) and yearly birthdays, shown as sticky notes in the owner's colour. Anyone can comment.
- Light (pink trees) and dark (Hollow Knight–style) themes, toggled with the sun/moon button and remembered per device.
- Changes sync live between devices and work offline (they upload when back online).

## Stack (all free tiers)

| Part | Choice |
|---|---|
| App | Vite + React + TypeScript, `vite-plugin-pwa` (manifest + service worker) |
| Data | Firebase Firestore (Spark plan), offline cache enabled |
| Lock | Firebase Auth, one email/password account; the password is the device code; `firestore.rules` only admits that account |
| Hosting | Vercel, via its native GitHub integration (auto-deploys `main`) |
| CI | GitHub Actions: lint, unit tests, build, audit, Playwright against the Firebase emulators |

## One-time setup

### 1. Firebase (free Spark plan, no card needed)
1. <https://console.firebase.google.com> → **Add project** → name `ourtings` (Analytics off).
2. **Build → Authentication → Get started → Email/Password → Enable**.
3. **Authentication → Users → Add user**: email `ourtings@noratikachung.com`, password = your shared secret code (≥ 6 characters; this is what you type on each device). The email must match `HOUSEHOLD_EMAIL` in `src/firebase.ts` and `firestore.rules`. No email is ever sent to it.
4. **Build → Firestore Database → Create database** → location `asia-southeast1` (Singapore) → **production mode**.
5. **Firestore → Rules**: paste the contents of `firestore.rules` → **Publish**. (Or `npx firebase deploy --only firestore:rules --project <project-id>` after `npx firebase login`.) Re-publish whenever `firestore.rules` changes; Vercel doesn't deploy it.
6. **Project settings → General → Your apps → Web (`</>`)** → register `OurTings` (no hosting). Copy `apiKey`, `authDomain`, `projectId`, `appId`.

These web config values are public by design; the rules are what protect the data. Changing the code later: **Authentication → Users** → delete the user, then **Add user** again with the same email and the new code. Every device is signed out and asks for the new code once.

### 2. GitHub
Create an empty repo `OurTings` under your account, then from this folder:
```sh
git add -A && git commit -m "OurTings v0.1"
git remote add origin https://github.com/NoratikaChung/OurTings.git
git push -u origin main
```

### 3. Vercel
1. **Add New → Project → Import** the `OurTings` repo. The `vercel.json` already sets Vite, `npm ci`, `npm run build`, output `dist`.
2. **Environment Variables** (Production + Preview): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` from step 1.6.
3. **Settings → Domains** → add `ourtings.noratikachung.com` and create the DNS record Vercel shows at your domain provider.

### 4. Install on each device
- **iPhone / iPad** (Safari): open the site → Share → **Add to Home Screen** → open it from the Home Screen → enter the code once. The installed app has its own storage, so unlock it there, not just in Safari.
- **Galaxy Tab S6 Lite** (Chrome): ⋮ → **Install app**.
- **Laptop** (Chrome/Edge): install icon in the address bar, or just use the website.

## Local development

Node 24. `npm ci`, then:

| Command | What |
|---|---|
| `npm run dev` | App against your real Firebase project (needs `.env.local` from `.env.example`) |
| `npm run emulators` + `npm run dev:emu` | App against local Firebase emulators (needs Java 21+); create the household user with any password via the emulator REST API or the e2e tests |
| `npm test` | Unit tests (date/birthday/overlap logic) |
| `npm run test:e2e` | Playwright on iPhone 14 Pro Max, iPad Pro 12.9", Galaxy Tab, laptop viewports, against the emulators (needs Java 21+; `npx playwright install chromium webkit` once) |
| `npm run lint` / `npm run typecheck` / `npm run build` | Checks / production build |
| `npm run icons` | Regenerate PWA icons from `public/icon.svg` |

## Next phase (planned, not built)
- **Malaysia public holidays & Hindu events**: read public holiday calendar feeds through a small Vercel function (cached), shown as their own toggleable calendars.
- **Push notifications** when the other person adds an event: web-push with VAPID keys from a Vercel function. On iPhone/iPad this needs the Home Screen app (iOS 16.4+).

## Artwork
All illustrations (cat, bunny, Knight- and Hornet-style avatars, both landscapes, app icon) are original SVGs in `src/art/` and `public/icon.svg`, made for this app. Hollow Knight characters belong to Team Cherry; the dark theme is private, non-commercial fan art.
