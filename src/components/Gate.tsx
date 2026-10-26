import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowRight, KeyRound } from 'lucide-react';
import { auth, HOUSEHOLD_EMAIL } from '../firebase';
import { Avatar } from '../art/Avatar';
import { ThemeToggle } from './ui';
import type { Theme } from '../types';

/** One-time unlock per device: the shared code is the household account's password. */
export function Gate({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setWrong(false);
    try {
      await signInWithEmailAndPassword(auth, HOUSEHOLD_EMAIL, code);
    } catch {
      setWrong(true);
      setBusy(false);
    }
  };

  return (
    <main className="center-screen">
      <div className="top-right">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="duo">
        <Avatar user="nora" theme={theme} size={88} />
        <Avatar user="anant" theme={theme} size={88} />
      </div>
      <form className={`paper gate ${wrong ? 'shake' : ''}`} onSubmit={submit}>
        <KeyRound size={22} aria-hidden="true" className="gate-key" />
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Secret code"
          aria-label="Secret code"
          aria-invalid={wrong}
          autoComplete="current-password"
          autoFocus
        />
        <button type="submit" className="round-btn" disabled={busy || !code} aria-label="Unlock">
          <ArrowRight size={22} />
        </button>
      </form>
    </main>
  );
}
