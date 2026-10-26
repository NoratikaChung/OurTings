import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/400-italic.css';
import './styles.css';
import { App } from './App';

registerSW({
  immediate: true,
  // Browsers only look for a new version when a page loads, and an installed app is usually resumed rather than
  // reloaded, so also look each time it comes back to the foreground. autoUpdate then reloads into the new version
  // straight away, at a moment nobody is mid-edit (no timer while open, which could reload under an unsaved event).
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    document.addEventListener('visibilitychange', () => {
      // Offline: the check fails quietly and runs again next time.
      if (document.visibilityState === 'visible') registration.update().catch(() => undefined);
    });
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
