import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, HOUSEHOLD_EMAIL } from './firebase';
import { useCurrentUser, useTheme } from './lib/prefs';
import { Scenery } from './art/Scenery';
import { Gate } from './components/Gate';
import { Picker } from './components/Picker';
import { CalendarScreen } from './components/CalendarScreen';

const THEME_COLOR = { light: '#FBD9CC', dark: '#06101F' };

export function App() {
  const [theme, setTheme] = useTheme();
  const [user, setUser] = useCurrentUser();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUnlocked(u?.email === HOUSEHOLD_EMAIL)), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <>
      <Scenery theme={theme} />
      <div className="app">
        {unlocked === null ? null : !unlocked ? (
          <Gate theme={theme} onToggleTheme={toggleTheme} />
        ) : !user ? (
          <Picker theme={theme} onToggleTheme={toggleTheme} onPick={setUser} />
        ) : (
          <CalendarScreen key={user} user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={() => setUser(null)} />
        )}
      </div>
    </>
  );
}
