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

/** Hornet speaks the intro, then the steps appear one by one, then the app icon, then the outro. */
interface Script {
  intro: string;
  steps?: readonly Step[];
  outro?: string;
}

const GIFT = 'A gift, bound for your shell. Carry it home by clicking on your browser:';
const HOME = 'After you are done, seek this bunny on your home screen. Open it, and enjoy.';
const APPS = 'After you are done, seek this bunny among your apps. Open it, and enjoy.';

// Menu names checked against Apple and Google/Microsoft help pages (Oct 2026).
const SCRIPTS: Record<'call' | 'installed' | Platform, Script> = {
  call: { intro: 'Little ghost… a light flutters before you. Touch it.' },
  installed: { intro: 'The gift is yours.', outro: 'Seek this bunny among your apps. Open it, and enjoy.' },
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
const BEAT = Math.round(350 / TYPE_MS); // ticks of the typing clock before each step, the icon and the outro
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
  const { intro, steps = [], outro = '' } = script;
  // One clock, counted in typed characters, reveals everything top to bottom: the intro, each step,
  // the icon, then the outro. `at(i)` is when step i shows; i = steps.length is the icon, + 1 the outro.
  const at = (i: number) => intro.length + (i + 1) * BEAT;
  const total = outro ? at(steps.length + 1) + outro.length : intro.length;
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

  return (
    // Tapping the box finishes the line, like skipping dialog in the game.
    <section className="hk-dialog" onClick={() => setTyped(total)}>
      <DialogOrnament kind="top" />
      <p className="sr-only" aria-live="polite">
        {[intro, steps.map((s) => s.text).join(', then '), outro].filter(Boolean).join(' ')}
      </p>
      <div className="hk-dialog-text" aria-hidden="true">
        <p>{intro.slice(0, typed)}</p>
        {steps.length > 0 && typed >= at(0) && (
          <ol className="hk-steps">
            {steps
              .filter((_, i) => typed >= at(i))
              .map((s) => (
                <li key={s.text}>
                  <span className={s.round ? 'hk-step hk-step-round' : 'hk-step'}>
                    {s.share && <Share size={15} />}
                    {s.text}
                  </span>
                </li>
              ))}
          </ol>
        )}
        {outro && typed >= at(steps.length) && (
          // The bunny sits beside the outro ("[bunny] … seek this bunny"); the untyped rest keeps its space, so nothing reflows while typing.
          <div className="hk-outro">
            <img className="hk-dialog-icon" src={bunnyUrl} alt="" width={48} height={72} />
            <p>
              {outro.slice(0, Math.max(0, typed - at(steps.length + 1)))}
              <span className="hk-untyped">{outro.slice(Math.max(0, typed - at(steps.length + 1)))}</span>
            </p>
          </div>
        )}
      </div>
      <DialogOrnament kind="bottom" />
    </section>
  );
}
