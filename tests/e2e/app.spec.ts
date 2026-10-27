import { expect, test, type Browser, type Page } from '@playwright/test';

const PROJECT = 'demo-ourtings';
const AUTH = 'http://127.0.0.1:9099';
const FIRESTORE = 'http://127.0.0.1:8085';
const HOUSEHOLD_EMAIL = 'ourtings@noratikachung.com';
const CODE = 'test-secret-code';

async function signUp(email: string, password: string) {
  const res = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return (await res.json()) as { idToken: string };
}

test.beforeEach(async () => {
  await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
  await fetch(`${FIRESTORE}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await signUp(HOUSEHOLD_EMAIL, CODE);
});

/** Browser tabs always open on the welcome; its faint × leads to the app. */
async function openApp(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Close' }).click();
}

async function unlockAs(page: Page, name: 'Nora' | 'Anant') {
  await openApp(page);
  await page.getByLabel('Secret code').fill(CODE);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await expect(page.getByRole('button', { name: 'New event' })).toBeVisible();
}

async function newDevice(browser: Browser, page: Page) {
  const ctx = await browser.newContext({
    viewport: page.viewportSize(),
    userAgent: await page.evaluate(() => navigator.userAgent),
  });
  return ctx.newPage();
}

test('wrong code stays locked', async ({ page }) => {
  await openApp(page);
  await page.getByLabel('Secret code').fill('nope');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.getByLabel('Secret code')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('button', { name: /Nora/ })).toHaveCount(0);
});

test('two devices share events and comments; prefs and login persist', async ({ page, browser }) => {
  test.slow(); // ~40 steps across two browsers; WebKit on Windows takes ~60 s
  // 3 PM, so the 10:00 picnic has already ended today: it must still be listed for the day.
  const afternoon = new Date();
  afternoon.setHours(15, 0, 0, 0);
  await page.clock.setFixedTime(afternoon);
  await unlockAs(page, 'Nora');

  // Nora adds an event.
  await page.getByRole('button', { name: 'New event' }).click();
  await page.getByLabel('Title').fill('Picnic');
  await page.getByLabel('Start time').fill('10:00');
  await page.getByLabel('Place').fill('Botanic Garden');
  await page.getByRole('button', { name: 'Save' }).click();
  const note = page.getByRole('button', { name: /Picnic/ });
  await expect(note).toBeVisible();

  // Anant, on another device, sees it live and comments.
  const other = await newDevice(browser, page);
  await other.clock.setFixedTime(afternoon);
  await unlockAs(other, 'Anant');
  await other.getByRole('button', { name: /Picnic/ }).click();
  await expect(other.getByRole('dialog')).toContainText('Botanic Garden');
  await other.getByRole('textbox', { name: 'Comment' }).fill('Bring the mat!');
  await other.getByRole('button', { name: 'Send' }).click();

  // Nora sees the comment live, on the card and in the event.
  await expect(note).toContainText('Bring the mat!');
  await note.click();
  await expect(page.getByRole('dialog')).toContainText('Bring the mat!');
  await page.getByRole('button', { name: 'Close' }).click();

  // Filter and theme survive a reload, as do the chosen user and the unlock; the view always reopens on the month.
  await page.getByRole('button', { name: "Nora's calendar" }).click();
  await expect(note).toHaveCount(0);
  await page.getByRole('tab', { name: 'Week' }).click();
  await page.getByRole('button', { name: 'Light mode' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('tab', { name: 'Month' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: "Nora's calendar" })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: /Picnic/ })).toHaveCount(0);

  // Anant's own view is independent of Nora's toggles.
  await expect(other.getByRole('button', { name: /Picnic/ })).toBeVisible();

  // The user menu closes when you tap anywhere else.
  await page.getByRole('button', { name: 'Nora', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  await page.locator('.agenda h2').click(); // on a phone the menu itself covers the view tabs
  await expect(page.getByRole('button', { name: 'Log out' })).toHaveCount(0);

  // Explicit logout returns to the two icons; no code needed again.
  await page.getByRole('button', { name: 'Nora', exact: true }).click();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('button', { name: /Anant/ })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('button', { name: /Anant/ })).toBeVisible();
  await expect(page.getByLabel('Secret code')).toHaveCount(0);
});

test('editing and deleting an event', async ({ page }) => {
  await unlockAs(page, 'Anant');
  await page.getByRole('button', { name: 'New event' }).click();
  await page.getByLabel('Title').fill('Dentist');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: /Dentist/ }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Title').fill('Dentist 🦷');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('dialog')).toContainText('Dentist 🦷');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Tap again to delete' }).click();
  await expect(page.getByRole('button', { name: /Dentist/ })).toHaveCount(0);
});

test('welcome: butterfly reveals install steps and the whisper; × leads to the code screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Install OurTings' }).click();
  const dialog = page.locator('.hk-dialog');
  await expect(dialog).toContainText('seek this bunny');
  // Each device gets its own browser's install steps.
  const step: Record<string, string> = {
    iphone: '···', // Safari's page menu, only on iPhone
    'ipad-pro-12.9': 'View More',
    'galaxy-tab': 'Install and create shortcut',
    laptop: 'Cast, save, and share',
  };
  await expect(page.locator('.hk-steps')).toContainText(step[test.info().project.name]);
  await expect(page.getByText('you know who to ask for the secret code')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByLabel('Secret code')).toBeVisible();
});

test('installed app skips the welcome', async ({ page }) => {
  await page.addInitScript(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = (q: string) =>
      q === '(display-mode: standalone)' ? ({ ...real(q), matches: true } as MediaQueryList) : real(q);
  });
  await page.goto('/');
  await expect(page.getByLabel('Secret code')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Install OurTings' })).toHaveCount(0);
});

test('Firestore rules reject strangers and anonymous access', async () => {
  const url = `${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)/documents/events`;
  expect((await fetch(url)).status).toBe(403);
  const { idToken } = await signUp('stranger@example.com', 'whatever123');
  expect((await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } })).status).toBe(403);
});
