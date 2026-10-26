/** Install helpers. iOS/iPadOS can only install via Share → Add to Home Screen; Chromium offers a prompt. */

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Chromium fires this once, early in page life; keep it so the butterfly tap can open the prompt later.
let deferredPrompt: InstallPromptEvent | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e as InstallPromptEvent;
});

/** Running as the installed Home Screen / desktop app rather than in a browser tab. */
export const isInstalled = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export type Platform = 'iphone' | 'ipad' | 'android' | 'edge' | 'desktop';

const ua = navigator.userAgent;
/** Decides which install steps to show; iPadOS reports itself as a Mac, so touch support identifies it. */
export const platform: Platform =
  /iPhone|iPod/.test(ua) ? 'iphone'
  : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ipad'
  : /Android/.test(ua) ? 'android'
  : /Edg\//.test(ua) ? 'edge'
  : 'desktop';

export type InstallOutcome = 'installed' | 'dismissed' | 'manual';

/** Must run inside a user gesture. 'manual' = this browser has no prompt (iOS, Firefox, Safari desktop). */
export async function requestInstall(): Promise<InstallOutcome> {
  const prompt = deferredPrompt;
  if (!prompt) return 'manual';
  deferredPrompt = null; // a prompt event can only be used once
  await prompt.prompt();
  return (await prompt.userChoice).outcome === 'accepted' ? 'installed' : 'dismissed';
}
