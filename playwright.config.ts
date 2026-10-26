import { defineConfig, devices } from '@playwright/test';

// Runs inside `firebase emulators:exec` (see `npm run test:e2e`); the app talks only to the local emulators.
export default defineConfig({
  testDir: 'tests/e2e',
  workers: 1, // tests share one emulator database
  timeout: 90_000, // WebKit on Windows is slow (~3 s per tap)
  reporter: [['list'], ['html', { open: 'never' }]],
  // Reduced motion stops the decorative background animations (and holds the welcome butterfly still).
  use: { baseURL: 'http://127.0.0.1:5174', trace: 'retain-on-failure', reducedMotion: 'reduce' },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 14 Pro Max'] } },
    { name: 'ipad-pro-12.9', use: { ...devices['iPad Pro 11'], viewport: { width: 1024, height: 1366 } } },
    { name: 'galaxy-tab', use: { ...devices['Galaxy Tab S4'] } },
    { name: 'laptop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npx vite --mode emulator --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
  },
});
