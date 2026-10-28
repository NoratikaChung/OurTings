import { expect, test, type Page } from '@playwright/test';

const AUTH = 'http://127.0.0.1:9099';
const FIRESTORE = 'http://127.0.0.1:8085';
const PROJECT = 'demo-ourtings';
const CODE = 'test-secret-code';

// A phone-sized touch screen. Real touch drags need the Chrome DevTools Protocol, so this runs on Chromium only.
test.use({ viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true });

test.beforeEach(async ({ browserName }) => {
  test.skip(browserName !== 'chromium', 'touch drags are sent through the Chrome DevTools Protocol');
  await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
  await fetch(`${FIRESTORE}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ourtings@noratikachung.com', password: CODE, returnSecureToken: true }),
  });
});

/** A finger drag from one point to another, in small steps like a real swipe. */
async function drag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  const cdp = await page.context().newCDPSession(page);
  const at = (t: number) => [{ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(0) });
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(i / 10) });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

const swipe = (page: Page, fromX: number, toX: number, y: number) => drag(page, { x: fromX, y }, { x: toX, y });

test('swiping moves every view to the future and the past', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByLabel('Secret code').fill(CODE);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await page.getByRole('button', { name: /Nora/ }).click();
  const title = page.locator('.topbar .title');

  for (const view of ['Day', 'Week', 'Month', 'Year']) {
    await page.getByRole('tab', { name: view }).click();
    const box = (await page.locator('.view').boundingBox())!;
    const y = box.y + Math.min(box.height / 2, 300);
    const now = await title.textContent();

    // Finger right to left: the future, as the › button.
    await swipe(page, box.x + box.width - 40, box.x + 40, y);
    await expect(title, `${view} swipe to the future`).not.toHaveText(now!);
    const future = await title.textContent();
    await page.getByRole('button', { name: 'Previous' }).click();
    await expect(title).toHaveText(now!);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(title).toHaveText(future!);
    await page.getByRole('button', { name: 'Previous' }).click();

    // Finger left to right: the past.
    await swipe(page, box.x + 40, box.x + box.width - 40, y);
    await expect(title, `${view} swipe to the past`).not.toHaveText(now!);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(title).toHaveText(now!);
  }

  // Up and down drags still scroll (the timetable here) and don't change the week.
  await page.getByRole('tab', { name: 'Week' }).click();
  const week = await title.textContent();
  const timetable = page.locator('.timetable');
  const box = (await timetable.boundingBox())!;
  const before = await timetable.evaluate((el) => el.scrollTop);
  await drag(page, { x: box.x + box.width / 2, y: box.y + box.height - 60 }, { x: box.x + box.width / 2, y: box.y + 150 });
  await expect.poll(() => timetable.evaluate((el) => el.scrollTop)).toBeGreaterThan(before + 100);
  await expect(title).toHaveText(week!);
});
