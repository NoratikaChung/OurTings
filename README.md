# OurTings

Private shared calendar for Nora and Anant. Installable web app (PWA) for iPhone, iPad, Android tablet and laptop. Live at <https://ourtings.noratikachung.com>.

- Opening the link in a browser shows a Hollow Knight–style welcome: Hornet asks you to touch the glowing butterfly; tapping it opens the install prompt where the browser supports one (Android/desktop Chrome, Edge) and reveals a glowing garden with that device's install steps (Apple doesn't allow a button to install, so iPhone/iPad get the Add to Home Screen steps). A faint × skips to the app. The installed app never shows the welcome.
- Unlock each device once with a shared secret code, then tap your icon (white elf/Hornet = Nora, Totoro/Knight = Anant). You stay that user until **Log out**.
- Day / week / month / year views. Show or hide each person's calendar; the toggles and last view are remembered per user on each device.
- Events (name, notes, place, date & time, all-day) and yearly birthdays, shown as sticky notes in the owner's colour. Anyone can comment.
- Dark (Hollow Knight–style) is the default theme; light (Studio Ghibli–style: Howl's castle valley with drifting mist, Totoro flying about and the white elf toddling along the bottom) is the alternative, via the sun/moon button and remembered per device.
- Changes sync live between devices and work offline (they upload when back online).

## Stack (all free tiers)

| Part | Choice |
|---|---|
| App | Vite + React + TypeScript, `vite-plugin-pwa` (manifest + service worker) |
| Data | Firebase Firestore (Spark plan), offline cache enabled |
| Lock | Firebase Auth, one email/password account; the password is the device code; `firestore.rules` only admits that account |
| Hosting | Vercel, via its native GitHub integration: every push to `main` deploys immediately, in parallel with CI (it does not wait for the checks unless Vercel **Deployment Checks** are turned on for the `verify` job) |
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
Repo: <https://github.com/NoratikaChung/OurTings> (private). Vercel's free plan only deploys commits on a private repo whose **author** is the Vercel account owner, so this repo authors commits as the NoratikaChung account. On a new machine, set it once inside the repo:
```sh
git config user.name "Noratika Chung"
git config user.email "101931866+NoratikaChung@users.noreply.github.com"
```
Commits authored with the work email are blocked by Vercel ("Deployment was blocked").

### 3. Vercel
1. **Add New → Project → Import** the `OurTings` repo. The `vercel.json` already sets Vite, `npm ci`, `npm run build`, output `dist`.
2. **Environment Variables** (Production + Preview): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` from step 1.6.
3. **Settings → Domains** → add `ourtings.noratikachung.com` and create the DNS record Vercel shows at your domain provider.

### 4. Install on each device
The welcome page shows these steps too. Install, open the app from its icon, then enter the code once (the installed app has its own storage).
- **iPhone** (Safari): **···** → **Share** → **View More** → **Add to Home Screen**.
- **iPad** (Safari): **Share** → **View More** → **Add to Home Screen**.
- **Galaxy Tab S6 Lite** (Chrome): **⋮** → **Install and create shortcut** → **Install**.
- **Laptop**: Chrome **⋮** → **Cast, save, and share** → **Install OurTings**; Edge **···** → **Apps** → **Install this site as an app**. Or just use the website.

## Local development

Node 24. `npm ci`, then:

| Command | What |
|---|---|
| `npm run dev` | App against your real Firebase project (needs `.env.local` from `.env.example`) |
| `npm run emulators` + `npm run dev:emu` | App against local Firebase emulators (needs Java 21+); create the household user with any password via the emulator REST API or the e2e tests |
| `npm test` | Unit tests (date/birthday/overlap logic) |
| `npm run test:e2e` | Playwright on iPhone 14 Pro Max, iPad Pro 12.9", Galaxy Tab, laptop viewports, against the emulators (needs Java 21+; `npx playwright install chromium webkit` once) |
| `npm run lint` / `npm run typecheck` / `npm run build` | Checks / production build |
| `npm run icons` | Regenerate PWA icons from `public/icon.png` |

## Next phase (planned, not built)
- **Malaysia public holidays & Hindu events**: read public holiday calendar feeds through a small Vercel function (cached), shown as their own toggleable calendars.
- **Push notifications** when the other person adds an event: web-push with VAPID keys from a Vercel function. On iPhone/iPad this needs the Home Screen app (iOS 16.4+).

## Artwork
The dark landscape, the welcome scenery and the cavern frame and cloaks of the dark avatars are original SVGs in `src/art/`. Pictures supplied by the user (originals in `assets/`, prepared copies in `src/art/`): the welcome page's Hornet and Knight (`welcome/`, trimmed and mirrored); the avatar pictures (`avatar/`: Hornet and Knight masks trimmed, Totoro badge cut to its circle, white elf); the light theme's valley background, flying Totoro and white elf (`ghibli/`; the background is only 720×405, so it looks soft on big screens). The app icon is the user's bunny picture (`assets/icons/`): `public/icon.png` is that bunny on a transparent square, rendered on black for iPhone/iPad and Android and kept transparent elsewhere (`npm run icons`). Totoro and Howl's Moving Castle belong to Studio Ghibli and Hollow Knight to Team Cherry; this is a private, non-commercial project, so keep the repository private.
