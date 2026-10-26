import { useEffect, useState } from 'react';
import { Share, X } from 'lucide-react';
import { WelcomeScene } from '../art/WelcomeScene';
import { DialogOrnament } from '../art/DialogOrnament';
import { platform, requestInstall, type InstallOutcome, type Platform } from '../lib/install';
import bunnyUrl from '../art/welcome/bunny.png';

/** One tap in the browser's own UI; `round` draws Safari's circled ··· button, `share` its Share icon. */
interface Step {
  text: string;
  round?: boolean;
  share?: boolean;
}

/** Hornet speaks the intro, the steps appear, then the app icon and the outro. */
interface Script {
  intro: string;
  steps?: readonly Step[];
  outro?: string;
}

const GIFT = 'A gift, bound for your shell. Carry it home thus:';
const HOME = 'Seek this bunny on your home screen. Open it, and enjoy.';
const APPS = 'Seek this bunny among your apps. Open it, and enjoy.';

// Menu names checked against Apple and Google/Microsoft help pages (Oct 2026).
const SCRIPTS: Record<'call' | 'installed' | Platform, Script> = {
  call: { intro: 'Little ghost… a gift flutters before you. Touch it.' },
  installed: { intro: 'The gift is yours.', outro: APPS },
  iphone: {
    intro: GIFT,
    steps: [{ text: '···', round: true }, { text: 'Share', share: true }, { text: 'View More' }, { text: 'Add to Home Screen' }],
    outro: HOME,
  },
  ipad: { intro: GIFT, steps: [{ text: 'Share', share: true }, { text: 'View More' }, { text: 'Add to Home Screen' }], outro: HOME },
  android: { intro: GIFT, steps: [{ text: '⋮' }, { text: 'Install and create shortcut' }, { text: 'Install' }], outro: APPS },
  edge: { intro: GIFT, steps: [{ text: '···' }, { text: 'Apps' }, { text: 'Install this site as an app' }], outro: APPS },
  desktop: { intro: GIFT, steps: [{ text: '⋮' }, { text: 'Cast, save, and share' }, { text: 'Install OurTings' }], outro: APPS },
};

const TYPE_MS = 28;
const REVEAL_MS = 1500; // let the light finish spreading before Hornet speaks again

/** Hollow Knight–style landing shown in the browser: tap the butterfly to install, then see how to open the app. */
export function Welcome({ onClose }: { onClose: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState<InstallOutcome | null>(null);

  const script =
    !revealed ? SCRIPTS.call
    : outcome === 'installed' ? SCRIPTS.installed
    : outcome ? SCRIPTS[platform]
    : null; // waiting for the browser's install prompt to be answered

  const tapButterfly = () => {
    setRevealed(true);
    requestInstall().then(setOutcome, () => setOutcome('manual'));
  };

  return (
    <main className="welcome-page">
      <WelcomeScene
        revealed={revealed}
        onButterfly={tapButterfly}
        whisper={revealed ? 'psst… you know who to ask for the secret code.' : undefined}
      />
      {script && <Dialog key={script.intro + (script.outro ?? '')} script={script} delay={revealed ? REVEAL_MS : 400} />}
      <button type="button" className="hk-close" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
    </main>
  );
}

function Dialog({ script, delay }: { script: Script; delay: number }) {
  const { intro, steps, outro = '' } = script;
  const total = intro.length + outro.length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [typed, setTyped] = useState(reduced ? total : 0);

  useEffect(() => {
    if (reduced) return;
    let timer: number | undefined;
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => setTyped((n) => (n >= total ? n : n + 1)), TYPE_MS);
    }, delay);
    return () => (window.clearTimeout(start), window.clearInterval(timer));
  }, [delay, reduced, total]);

  const introDone = typed >= intro.length;

  return (
    // Tapping the box finishes the line, like skipping dialog in the game.
    <section className="hk-dialog" onClick={() => setTyped(total)}>
      <DialogOrnament kind="top" />
      <p className="sr-only" aria-live="polite">
        {[intro, steps?.map((s) => s.text).join(', then '), outro].filter(Boolean).join(' ')}
      </p>
      <div className="hk-dialog-text" aria-hidden="true">
        <p>{intro.slice(0, typed)}</p>
        {steps && introDone && (
          <ol className="hk-steps">
            {steps.map((s, i) => (
              <li key={s.text} style={{ animationDelay: `${i * 0.25}s` }}>
                <span className={s.round ? 'hk-step hk-step-round' : 'hk-step'}>
                  {s.share && <Share size={15} />}
                  {s.text}
                </span>
              </li>
            ))}
          </ol>
        )}
        {outro && introDone && (
          <img className="hk-dialog-icon" src={bunnyUrl} alt="" width={48} height={72} />
        )}
        {outro && <p>{outro.slice(0, Math.max(0, typed - intro.length))}</p>}
      </div>
      <DialogOrnament kind="bottom" />
    </section>
  );
}
