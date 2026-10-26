import { useId, type ReactNode } from 'react';
import hornetUrl from './welcome/hornet.png';
import knightUrl from './welcome/knight.png';
import './welcome.css';

interface WelcomeSceneProps {
  /** false = page 1 (the dark), true = page 2 (garden revealed). */
  revealed: boolean;
  /** Called when the glowing butterfly is tapped. */
  onButterfly: () => void;
  /** Small whisper bubble near Hornet's head, shown only when revealed. */
  whisper?: ReactNode;
}

/**
 * Full-viewport welcome stage. Ground line sits at 75% of the viewport height; the two characters
 * stand on it, centred. Sizes derive from `--welcome-unit` (the Knight's height), see welcome.css.
 */
export function WelcomeScene({ revealed, onButterfly, whisper }: WelcomeSceneProps) {
  const glow = `welcome-glow${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <div className={`welcome${revealed ? ' welcome--revealed' : ''}`}>
      <svg className="welcome-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="soft" />
            <feMerge>
              <feMergeNode in="soft" />
              <feMergeNode in="soft" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <TheDark />
      <Garden glow={glow} />
      <Ground />
      <div className="welcome-shade" aria-hidden="true" />

      <div className="welcome-cast">
        <img className="welcome-hornet" src={hornetUrl} alt="" />
        <img className="welcome-knight" src={knightUrl} alt="" />
        {revealed && whisper != null && <div className="welcome-whisper">{whisper}</div>}
      </div>

      {revealed ? (
        <span className="welcome-burst" aria-hidden="true">
          <span className="welcome-flash" />
          <svg className="welcome-burst-moth" viewBox="-20 -20 40 40">
            <Moth glow={glow} />
          </svg>
          {SPARK_ANGLES.map((angle) => (
            <span key={angle} className="welcome-spark-arm" style={{ transform: `rotate(${angle}deg)` }}>
              <span className="welcome-spark" style={{ animationDelay: `${(angle % 60) / 600}s` }} />
            </span>
          ))}
        </span>
      ) : (
        <button type="button" className="welcome-butterfly" aria-label="Install OurTings" onClick={onButterfly}>
          <span className="welcome-halo" />
          <svg className="welcome-wings" viewBox="-20 -20 40 40" aria-hidden="true">
            <Moth glow={glow} />
          </svg>
        </button>
      )}
    </div>
  );
}

const SPARK_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

/** Glowing pale-blue moth, same silhouette as the dark calendar background. */
function Moth({ glow }: { glow: string }) {
  return (
    <g filter={`url(#${glow})`}>
      <path
        fill="#BFE9FF"
        d="M-1-2C-4-15-16-18-17-9C-17.5-3-9 1-1 1ZM1-2C4-15 16-18 17-9C17.5-3 9 1 1 1ZM-1 1C-9 3-14 10-10 14C-6 16.5-2 10-1 2ZM1 1C9 3 14 10 10 14C6 16.5 2 10 1 2Z"
      />
      <path fill="#E8F6FF" d="M-2-3C-5-11-12-12-12-7C-12-3-7-1-2-1ZM2-3C5-11 12-12 12-7C12-3 7-1 2-1Z" />
      <ellipse cx="0" cy="0" rx="1.3" ry="5" fill="#E8F6FF" />
    </g>
  );
}

/* ================= page 1: the dark, a dim dome of cave around the pair ================= */

const STALACTITES: readonly (readonly [number, number, number])[] = [
  [150, 14, 170],
  [188, 9, 120],
  [222, 12, 150],
  [254, 7, 104],
  [382, 8, 112],
  [414, 12, 160],
  [448, 16, 196],
  [484, 10, 140],
];

function TheDark() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const air = `welcome-air${uid}`;
  const shaft = `welcome-domeshaft${uid}`;
  return (
    <div className="welcome-dark" aria-hidden="true">
      <svg className="welcome-dome" viewBox="0 0 620 360">
        <defs>
          <radialGradient id={air} cx="50%" cy="88%" r="70%">
            <stop offset="0" stopColor="#6E7FA0" />
            <stop offset="0.45" stopColor="#3A4664" />
            <stop offset="1" stopColor="#0E121C" />
          </radialGradient>
          <linearGradient id={shaft} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E6EEFF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#E6EEFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="620" height="360" fill={`url(#${air})`} />
        <g fill="#8C9CBC" opacity="0.32">
          <path d="M96 360C118 236 214 120 352 70L372 88C244 140 160 240 138 360Z" />
          <path d="M520 360C506 250 446 160 360 112L346 128C424 178 474 260 482 360Z" />
          <path d="M250 360C262 300 300 248 352 220L360 234C318 262 290 306 282 360Z" />
        </g>
        <g fill="#A9B7D2" opacity="0.22">
          <path d="M380 360L404 196L414 198L396 360ZM420 360L452 224L462 228L438 360Z" />
          <path d="M184 360L200 238L208 240L198 360Z" />
        </g>
        <g fill="#2A334A">
          <path d="M60 360C80 330 120 322 150 336C176 318 214 318 236 338C262 328 290 332 300 350L300 360Z" />
          <path d="M330 360C344 336 380 326 410 340C440 320 486 322 510 342C536 332 566 340 580 360Z" />
        </g>
        <g className="welcome-domeshafts" fill={`url(#${shaft})`}>
          <path d="M120 40L170 40L250 360L170 360Z" opacity="0.5" />
          <path d="M400 30L430 30L470 360L420 360Z" opacity="0.35" />
        </g>
        <g fill="#020307">
          {STALACTITES.map(([x, w, h]) => (
            <path key={x} d={`M${x - w} 0H${x + w}C${x + w * 0.6} ${h * 0.5} ${x + w * 0.2} ${h * 0.8} ${x} ${h}C${x - w * 0.3} ${h * 0.75} ${x - w * 0.7} ${h * 0.45} ${x - w} 0Z`} />
          ))}
          <path d="M0 0H620V40C560 34 520 52 470 40C420 30 380 52 320 42C260 32 220 54 160 40C110 30 60 46 0 38Z" />
        </g>
        <g fill="#D8E4FF" opacity="0.55">
          <circle cx="210" cy="190" r="1.6" />
          <circle cx="330" cy="150" r="1.2" />
          <circle cx="420" cy="230" r="1.5" />
          <circle cx="280" cy="260" r="1" />
        </g>
      </svg>
    </div>
  );
}

/* ================= shared ground ledge ================= */

/** Flat stone slabs along the ledge top, laid deterministically so the ground never jumps between renders. */
const SLABS = (() => {
  const slabs: (readonly [number, number])[] = [];
  let x = -10;
  let s = 3;
  while (x < 1450) {
    s = (s * 16807) % 2147483647;
    const w = 46 + (s % 50);
    slabs.push([x, w]);
    x += w + 5;
  }
  return slabs;
})();

function Ground() {
  const earth = `welcome-earth${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className="welcome-ground" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id={earth} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16223A" />
          <stop offset="0.35" stopColor="#0A101D" />
          <stop offset="1" stopColor="#04070D" />
        </linearGradient>
      </defs>
      <rect y="6" width="1440" height="294" fill={`url(#${earth})`} />
      <g fill="#1A2336">
        {SLABS.map(([x, w]) => (
          <rect key={x} x={x} y="0" width={w} height="16" rx="7" />
        ))}
      </g>
      <g fill="none" stroke="#5A6F95" strokeWidth="2.2" strokeLinecap="round" opacity="0.8">
        {SLABS.map(([x, w]) => (
          <path key={x} d={`M${x + 6} 2.5H${x + w - 8}`} />
        ))}
      </g>
      <path
        d="M0 52C200 44 420 62 640 50C860 38 1100 58 1440 48M0 110C260 102 520 120 780 108C1040 96 1240 114 1440 106"
        fill="none"
        stroke="#1C2840"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/* ================= page 2: the glowing garden ================= */

/** Flower-of-life petal centres around a radius-48 ring. */
const PETALS = [0, 60, 120, 180, 240, 300].map((deg) => [
  48 * Math.cos((deg * Math.PI) / 180),
  48 * Math.sin((deg * Math.PI) / 180),
]);

const ROSETTES = [
  { left: '-22%', top: '-10%', width: 'clamp(340px, 78vmin, 820px)', core: false, duration: 160 },
  { left: '58%', top: '34%', width: 'clamp(200px, 36vmin, 400px)', core: true, duration: 120 },
  { left: '4%', top: '50%', width: 'clamp(110px, 18vmin, 200px)', core: false, duration: 90 },
];

const VINES = [
  { left: '7%', height: '44vh', duration: 9, delay: 0 },
  { left: '19%', height: '30vh', duration: 11, delay: -4 },
  { left: '71%', height: '52vh', duration: 10, delay: -2 },
  { left: '83%', height: '34vh', duration: 12, delay: -7 },
  { left: '93%', height: '46vh', duration: 9.5, delay: -5 },
];

const HEARTS: readonly (readonly [number, number, number, boolean])[] = [
  [16, 60, 20, false],
  [24, 120, -30, false],
  [14, 180, 24, false],
  [24, 240, -20, false],
  [16, 300, 30, true],
  [22, 350, -16, true],
];

const PLANTS = [
  { kind: 'tall', left: '1%', scale: 2.5, sway: true, delay: 0 },
  { kind: 'bush', left: '15%', scale: 1.1, sway: false, delay: 0 },
  { kind: 'sprig', left: '27%', scale: 0.9, sway: true, delay: -2 },
  { kind: 'sprig', left: '68%', scale: 1, sway: true, delay: -1 },
  { kind: 'bush', left: '79%', scale: 1.3, sway: false, delay: 0 },
  { kind: 'tall', left: '90%', scale: 1.8, sway: true, delay: -3 },
] as const;

const ORBS = [
  { left: '12%', top: '72%', size: 30, delay: 0 },
  { left: '33%', top: '74%', size: 18, delay: -1.5 },
  { left: '62%', top: '73%', size: 24, delay: -3 },
  { left: '86%', top: '70%', size: 34, delay: -2 },
];

const FLUTTERS = [
  { left: '14%', top: '40%', size: 24, duration: 18, delay: -3 },
  { left: '30%', top: '58%', size: 18, duration: 22, delay: -9 },
  { left: '64%', top: '44%', size: 22, duration: 20, delay: -5 },
  { left: '82%', top: '58%', size: 28, duration: 24, delay: -12 },
  { left: '46%', top: '30%', size: 16, duration: 19, delay: -7 },
  { left: '90%', top: '30%', size: 20, duration: 21, delay: -15 },
];

const MOTES = [
  { left: '8%', top: '74%', duration: 18, delay: -2 },
  { left: '26%', top: '76%', duration: 20, delay: -6 },
  { left: '44%', top: '60%', duration: 19, delay: -4 },
  { left: '57%', top: '74%', duration: 23, delay: -11 },
  { left: '75%', top: '76%', duration: 25, delay: -16 },
  { left: '95%', top: '74%', duration: 22, delay: -13 },
];

function Garden({ glow }: { glow: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const beam = `welcome-beam${uid}`;
  const core = `welcome-core${uid}`;
  return (
    <div className="welcome-garden" aria-hidden="true">
      <svg className="welcome-beams" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={beam} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#DDF1FF" stopOpacity="0.28" />
            <stop offset="0.7" stopColor="#BFE6FF" stopOpacity="0.08" />
            <stop offset="1" stopColor="#BFE6FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="welcome-beam-a" fill={`url(#${beam})`}>
          <path d="M16 0H32L66 100H42Z" />
          <path d="M-12 0H0L26 100H12Z" />
        </g>
        <g className="welcome-beam-b" fill={`url(#${beam})`}>
          <path d="M40 0H47L84 100H72Z" />
          <path d="M58 0H62L96 100H90Z" />
        </g>
      </svg>

      {ROSETTES.map((r, i) => (
        <svg
          key={i}
          className="welcome-rosette"
          viewBox="-100 -100 200 200"
          style={{ left: r.left, top: r.top, width: r.width, animationDuration: `${r.duration}s` }}
        >
          {r.core && (
            <>
              <defs>
                <radialGradient id={core}>
                  <stop offset="0" stopColor="#F2FAFF" stopOpacity="0.85" />
                  <stop offset="0.45" stopColor="#BFE6FF" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#BFE6FF" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle r="98" fill={`url(#${core})`} />
            </>
          )}
          <g fill="none" stroke="#CFEAFF" strokeWidth={r.core ? 2.4 : 3.2} opacity={r.core ? 0.7 : 0.2}>
            <circle r="96" />
            <circle r="48" />
            {PETALS.map(([cx, cy], j) => (
              <circle key={j} cx={cx} cy={cy} r="48" />
            ))}
          </g>
        </svg>
      ))}

      <svg className="welcome-ceiling" viewBox="0 0 1440 160" preserveAspectRatio="xMidYMin slice">
        <path
          fill="#03070F"
          d="M0 0H1440V70C1400 96 1360 88 1330 110C1290 140 1240 100 1200 116C1150 136 1110 90 1060 100C1000 112 980 140 920 124C870 110 850 80 800 86C740 92 720 120 660 112C600 104 580 76 520 84C460 92 440 124 380 116C330 110 300 80 250 90C200 100 170 130 120 118C70 106 40 80 0 92Z"
        />
      </svg>

      {VINES.map((v, i) => (
        <svg
          key={i}
          className="welcome-vine"
          viewBox="0 0 40 400"
          preserveAspectRatio="xMidYMin meet"
          style={{ left: v.left, height: v.height, animationDuration: `${v.duration}s`, animationDelay: `${v.delay}s` }}
        >
          <path d="M20 0C13 60 27 120 18 180C11 240 25 300 19 360C18 376 20 388 22 396" fill="none" stroke="#02060D" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="22" cy="396" r="4" fill="#02060D" />
          {HEARTS.map(([x, y, rot, lit], j) => (
            <path
              key={j}
              d="M0 0C-3-4-9-3-9 1C-9 5-3 8 0 11C3 8 9 5 9 1C9-3 3-4 0 0Z"
              transform={`translate(${x} ${y}) rotate(${rot})`}
              fill={lit ? '#9FD8FF' : '#02060D'}
              filter={lit ? `url(#${glow})` : undefined}
            />
          ))}
        </svg>
      ))}

      <svg className="welcome-sprout" viewBox="0 0 100 140">
        <path d="M52 140C50 110 54 80 48 54" fill="none" stroke="#02050B" strokeWidth="6" strokeLinecap="round" />
        <path fill="#02050B" d="M48 56C30 60 6 46 8 26C10 8 34 4 44 22C48 30 49 44 48 56Z" />
        <path fill="#02050B" d="M49 52C60 36 80 22 94 30C104 38 96 58 78 62C66 64 56 60 49 52Z" />
      </svg>

      {PLANTS.map((p, i) => (
        <svg
          key={i}
          className={`welcome-plant${p.sway ? ' welcome-plant--sway' : ''}`}
          viewBox="0 0 100 200"
          style={{ left: p.left, height: `calc(var(--welcome-unit) * ${p.scale})`, animationDelay: `${p.delay}s` }}
        >
          <Plant kind={p.kind} glow={glow} />
        </svg>
      ))}

      {ORBS.map((o, i) => (
        <span
          key={i}
          className="welcome-orb"
          style={{ left: o.left, top: o.top, width: o.size, height: o.size, animationDelay: `${o.delay}s` }}
        />
      ))}

      {FLUTTERS.map((f, i) => (
        <svg
          key={i}
          className="welcome-flutter"
          viewBox="-20 -20 40 40"
          style={{ left: f.left, top: f.top, width: f.size, animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s` }}
        >
          <Moth glow={glow} />
        </svg>
      ))}

      {MOTES.map((m, i) => (
        <span
          key={i}
          className="welcome-mote"
          style={{ left: m.left, top: m.top, animationDuration: `${m.duration}s`, animationDelay: `${m.delay}s` }}
        />
      ))}
    </div>
  );
}

const LEAF = 'M0 0C-5-9-15-12-16-4C-16 2-7 3 0 0ZM0 0C5-9 15-12 16-4C16 2 7 3 0 0ZM0 1C-5 3-9 8-6 10C-3 11-1 6 0 2ZM0 1C5 3 9 8 6 10C3 11 1 6 0 2Z';
const LEAF_CORE = 'M0-1C-4-7-11-9-11-4C-11-1-5 0 0-1ZM0-1C4-7 11-9 11-4C11-1 5 0 0-1Z';

const PLANT_SHAPES = {
  tall: {
    stems: 'M50 200C46 160 58 120 48 70C45 50 47 34 52 18M49 128C60 116 70 104 76 88M48 92C38 80 30 66 26 52',
    leaves: [
      [52, 16, 1.5, 0],
      [76, 86, 1.2, 24],
      [26, 50, 1.2, -24],
      [56, 150, 0.9, 30],
      [44, 112, 0.8, -30],
    ],
  },
  bush: {
    stems: 'M50 200C48 186 40 176 30 170M50 200C52 184 60 172 70 166M50 200C50 182 50 172 50 160',
    leaves: [
      [30, 168, 1, -30],
      [70, 164, 1, 30],
      [50, 158, 1.1, 0],
      [38, 184, 0.8, -50],
      [62, 184, 0.8, 50],
    ],
  },
  sprig: {
    stems: 'M50 200C48 180 54 160 50 140',
    leaves: [
      [50, 138, 1.1, 0],
      [52, 170, 0.7, 40],
    ],
  },
} as const;

/** Glowing butterfly-leaf plant; base sits on the bottom edge of its 100×200 box. */
function Plant({ kind, glow }: { kind: keyof typeof PLANT_SHAPES; glow: string }) {
  const shape = PLANT_SHAPES[kind];
  return (
    <>
      <path d={shape.stems} fill="none" stroke="#0A1A30" strokeWidth="3" strokeLinecap="round" />
      <g filter={`url(#${glow})`}>
        {shape.leaves.map(([x, y, s, rot], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
            <path d={LEAF} fill="#BFE9FF" />
            <path d={LEAF_CORE} fill="#E8F6FF" />
          </g>
        ))}
      </g>
    </>
  );
}
