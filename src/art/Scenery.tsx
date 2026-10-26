import { useId } from 'react';
import type { Theme } from '../types';
import backgroundUrl from './ghibli/background.jpg';
import totoroUrl from './ghibli/totoro.png';
import whiteElfUrl from './ghibli/white-elf.png';
import './scenery.css';

/** Full-viewport decorative backdrop. Detail lives near the top/bottom edges so the centre stays calm. */
export function Scenery({ theme }: { theme: Theme }) {
  return (
    <div className={`scenery scenery-${theme}`} aria-hidden="true">
      {theme === 'light' ? <Garden /> : <Cavern />}
    </div>
  );
}

/* ================= light: the user's Ghibli valley, drifting clouds, flying Totoro, white elf in the grass ================= */

/** Mist puffs over the picture's hills, the castle's feet and the sheep's hill (not its white clouds, where white mist vanishes); left/top/width in % of the picture. */
const MIST = [
  { left: 2, top: 30, width: 24, duration: 40, delay: -12 },
  { left: 14, top: 40, width: 26, duration: 46, delay: -30 },
  { left: 30, top: 44, width: 22, duration: 36, delay: -6 },
  { left: 42, top: 12, width: 20, duration: 50, delay: -24 },
  { left: 60, top: 62, width: 24, duration: 42, delay: -18 },
];

/** Big soft clouds crossing the whole screen; top in % of the screen. Front clouds pass over Totoro, the rest behind him. */
const DRIFTS = [
  { top: 2, duration: 160, delay: -20, front: false },
  { top: 9, duration: 240, delay: -190, front: true },
  { top: 16, duration: 210, delay: -120, front: false },
  { top: 26, duration: 180, delay: -70, front: true },
];

/** Sparse tall pampas reeds; left in % of the screen, height in multiples of the grass strip. */
const REEDS = [
  { left: 3, height: 1.7, duration: 7, delay: -1 },
  { left: 24, height: 2.1, duration: 8.5, delay: -4 },
  { left: 52, height: 1.5, duration: 6.5, delay: -2.5 },
  { left: 71, height: 1.9, duration: 7.8, delay: -5 },
  { left: 90, height: 1.6, duration: 7.2, delay: -3 },
];

interface Clump {
  delay: number;
  duration: number;
  blades: string[];
}

/** Tufts of grass spread across the 1440-wide foreground, fixed by seed so they never jump between renders. */
function grassClumps(seed: number, count: number, minH: number, maxH: number): Clump[] {
  const r = rng(seed);
  const f = (n: number) => n.toFixed(1);
  return Array.from({ length: count }, (_, i) => {
    const x = ((i + 0.5) / count) * 1440 + (r() - 0.5) * 30;
    const blades = Array.from({ length: 7 }, () => {
      const bx = x + (r() - 0.5) * 50;
      const h = minH + r() * (maxH - minH);
      const lean = (r() - 0.5) * 40;
      const w = 3 + r() * 3;
      return `M${f(bx - w / 2)} 204Q${f(bx + lean * 0.3)} ${f(204 - h * 0.6)} ${f(bx + lean)} ${f(204 - h)}Q${f(bx + lean * 0.3 + w * 0.4)} ${f(204 - h * 0.5)} ${f(bx + w / 2)} 204Z`;
    });
    return { delay: -r() * 6, duration: 5 + r() * 3, blades };
  });
}

const BACK_GRASS = grassClumps(5, 24, 50, 105);
const FRONT_GRASS = grassClumps(17, 28, 24, 62);

function Garden() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ground = `scenery-ground${uid}`;
  const backBlade = `scenery-backblade${uid}`;
  const frontBlade = `scenery-frontblade${uid}`;
  return (
    <>
      <img className="scenery-photo-fill" src={backgroundUrl} alt="" />
      <div className="scenery-photo">
        <img src={backgroundUrl} alt="" />
        {MIST.map((m) => (
          <span
            key={`${m.left}-${m.top}`}
            className="scenery-mist"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: `${m.width}%`,
              animationDuration: `${m.duration}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </div>
      {DRIFTS.filter((d) => !d.front).map((d) => (
        <span
          key={d.top}
          className="scenery-cloud"
          style={{ top: `${d.top}%`, animationDuration: `${d.duration}s`, animationDelay: `${d.delay}s` }}
        />
      ))}
      <div className="scenery-flyer">
        <img src={totoroUrl} alt="" />
      </div>
      {DRIFTS.filter((d) => d.front).map((d) => (
        <span
          key={d.top}
          className="scenery-cloud"
          style={{ top: `${d.top}%`, animationDuration: `${d.duration}s`, animationDelay: `${d.delay}s` }}
        />
      ))}
      <svg className="scenery-layer scenery-grass" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice">
        <defs>
          {/* Meadow greens picked from the picture; the strip fades in from the top so it has no edge. */}
          <linearGradient id={ground} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8DC24A" stopOpacity="0" />
            <stop offset="0.45" stopColor="#74AE3E" stopOpacity="0.85" />
            <stop offset="1" stopColor="#4C8A2D" />
          </linearGradient>
          <linearGradient id={backBlade} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#5E9C35" />
            <stop offset="1" stopColor="#A9D468" />
          </linearGradient>
          <linearGradient id={frontBlade} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#3F7A27" />
            <stop offset="1" stopColor="#8BC250" />
          </linearGradient>
        </defs>
        <path d="M0 204V108Q180 92 360 106T720 102T1080 108T1440 100V204Z" fill={`url(#${ground})`} />
        {BACK_GRASS.map((c, i) => (
          <g
            key={i}
            className="scenery-tuft"
            fill={`url(#${backBlade})`}
            opacity="0.85"
            style={{ animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
          >
            {c.blades.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        ))}
      </svg>
      {REEDS.map((r) => (
        <svg
          key={r.left}
          className="scenery-reed"
          viewBox="0 0 60 300"
          style={{
            left: `${r.left}%`,
            height: `calc(var(--grass) * ${r.height})`,
            animationDuration: `${r.duration}s`,
            animationDelay: `${r.delay}s`,
          }}
        >
          <g fill="none" strokeLinecap="round">
            <path d="M30 300C24 240 12 205 2 190" stroke="#6FA53C" strokeWidth="2.4" />
            <path d="M31 300C38 250 50 225 58 214" stroke="#7DB547" strokeWidth="2.4" />
            <path d="M30 300C30 230 31 160 35 104" stroke="#B5BE72" strokeWidth="2.6" />
          </g>
          <g className="scenery-plume" style={{ animationDelay: `${r.delay}s` }}>
            <path d="M35 112C26 96 24 66 30 40C33 26 37 16 40 10C44 24 46 44 45 66C44 86 41 102 35 112Z" fill="#F1E2BC" />
            <path d="M36 100C31 86 31 64 35 44C37 34 39 26 40 22C42 36 42 56 41 72C40 86 38 94 36 100Z" fill="#FFF8E4" />
            <path
              d="M33 92L27 84M33 78L26 70M34 64L28 55M38 86L44 79M39 70L45 62M39 54L44 46"
              stroke="#E2CC98"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
        </svg>
      ))}
      <div className="scenery-elf">
        <img src={whiteElfUrl} alt="" />
      </div>
      <svg className="scenery-layer scenery-grass" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice">
        {FRONT_GRASS.map((c, i) => (
          <g
            key={i}
            className="scenery-tuft"
            fill={`url(#${frontBlade})`}
            style={{ animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
          >
            {c.blades.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        ))}
        <rect y="188" width="1440" height="16" fill="#3F7A27" />
      </svg>
    </>
  );
}

/* ================= dark: glowing cavern ================= */

type Blob = readonly [number, number, number];

/** Three depth layers of bubbly rock, back to front. */
interface RockBlobs {
  far: Blob[];
  mid: Blob[];
  near: Blob[];
}

/** Tiny deterministic PRNG so the rock columns look hand-placed but stay stable across renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function columnBlobs(seed: number): RockBlobs {
  const r = rng(seed);
  const far: Blob[] = [];
  const mid: Blob[] = [];
  const near: Blob[] = [];
  for (let y = -60; y < 1080; y += 64) {
    far.push([120 + r() * 50, y + r() * 30, 40 + r() * 30]);
    mid.push([60 + r() * 60, y + 30 + r() * 30, 50 + r() * 34]);
    near.push([r() * 50, y + r() * 40, 52 + r() * 30]);
  }
  return { far, mid, near };
}

const LEFT_ROCKS = columnBlobs(7);
const RIGHT_ROCKS = columnBlobs(31);

const MOTHS = [
  { left: '9%', top: '12%', size: 34, duration: 17, delay: -2 },
  { left: '30%', top: '7%', size: 22, duration: 21, delay: -9 },
  { left: '64%', top: '18%', size: 26, duration: 19, delay: -5 },
  { left: '86%', top: '9%', size: 40, duration: 23, delay: -12 },
  { left: '4%', top: '58%', size: 28, duration: 20, delay: -7 },
  { left: '90%', top: '52%', size: 30, duration: 18, delay: -3 },
  { left: '22%', top: '82%', size: 44, duration: 25, delay: -15 },
  { left: '72%', top: '78%', size: 24, duration: 22, delay: -11 },
  { left: '48%', top: '90%', size: 20, duration: 16, delay: -6 },
];

const MOTES = [
  { left: '12%', top: '72%', duration: 22, delay: -3 },
  { left: '20%', top: '96%', duration: 26, delay: -14 },
  { left: '28%', top: '58%', duration: 19, delay: -8 },
  { left: '35%', top: '88%', duration: 24, delay: -1 },
  { left: '42%', top: '66%', duration: 28, delay: -20 },
  { left: '46%', top: '100%', duration: 21, delay: -10 },
  { left: '53%', top: '80%', duration: 25, delay: -5 },
  { left: '58%', top: '60%', duration: 18, delay: -12 },
  { left: '64%', top: '94%', duration: 27, delay: -18 },
  { left: '70%', top: '70%', duration: 20, delay: -2 },
  { left: '78%', top: '86%', duration: 23, delay: -16 },
  { left: '84%', top: '64%', duration: 26, delay: -7 },
  { left: '50%', top: '40%', duration: 22, delay: -9 },
  { left: '38%', top: '30%', duration: 25, delay: -19 },
];

function Cavern() {
  const glow = `scenery-glow${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <>
      <svg className="scenery-defs" width="0" height="0">
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

      <div className="scenery-shaft" />

      <RockColumn blobs={LEFT_ROCKS} side="left" />
      <RockColumn blobs={RIGHT_ROCKS} side="right" />

      <svg className="scenery-layer scenery-floor" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice">
        <g fill="#1F4677" opacity="0.55">
          <circle cx="160" cy="170" r="50" />
          <circle cx="330" cy="160" r="44" />
          <circle cx="480" cy="176" r="48" />
          <circle cx="640" cy="164" r="40" />
          <circle cx="800" cy="172" r="52" />
          <circle cx="960" cy="160" r="44" />
          <circle cx="1120" cy="170" r="50" />
          <circle cx="1290" cy="162" r="46" />
        </g>
        <g fill="#14305A" stroke="#2F6198" strokeWidth="3" strokeOpacity="0.45">
          <circle cx="250" cy="200" r="90" />
          <circle cx="560" cy="210" r="80" />
          <circle cx="900" cy="205" r="86" />
          <circle cx="1200" cy="200" r="92" />
        </g>
        <g fill="#0B1C36" stroke="#24507F" strokeWidth="3" strokeOpacity="0.5">
          <circle cx="90" cy="190" r="80" />
          <circle cx="400" cy="214" r="74" />
          <circle cx="720" cy="220" r="78" />
          <circle cx="1050" cy="216" r="76" />
          <circle cx="1360" cy="192" r="84" />
        </g>
        <g fill="#BFE9FF" opacity="0.75">
          <circle cx="330" cy="128" r="3" />
          <circle cx="620" cy="142" r="2.5" />
          <circle cx="985" cy="130" r="3" />
          <circle cx="1150" cy="122" r="2.5" />
        </g>
      </svg>

      <Platform className="scenery-platform scenery-platform-a" />
      <Platform className="scenery-platform scenery-platform-b" />

      {MOTES.map((m, i) => (
        <span
          key={i}
          className="scenery-mote"
          style={{ left: m.left, top: m.top, animationDuration: `${m.duration}s`, animationDelay: `${m.delay}s` }}
        />
      ))}

      {MOTHS.map((m, i) => (
        <span
          key={i}
          className="scenery-moth"
          style={{ left: m.left, top: m.top, width: m.size, height: m.size, animationDuration: `${m.duration}s`, animationDelay: `${m.delay}s` }}
        >
          <svg
            className="scenery-wings"
            viewBox="-20 -20 40 40"
            style={{ animationDuration: `${1.8 + (i % 3) * 0.5}s`, animationDelay: `${-i * 0.37}s` }}
          >
            <g filter={`url(#${glow})`}>
              <path
                fill="#BFE9FF"
                d="M-1-2C-4-15-16-18-17-9C-17.5-3-9 1-1 1ZM1-2C4-15 16-18 17-9C17.5-3 9 1 1 1ZM-1 1C-9 3-14 10-10 14C-6 16.5-2 10-1 2ZM1 1C9 3 14 10 10 14C6 16.5 2 10 1 2Z"
              />
              <path fill="#E8F6FF" d="M-2-3C-5-11-12-12-12-7C-12-3-7-1-2-1ZM2-3C5-11 12-12 12-7C12-3 7-1 2-1Z" />
              <ellipse cx="0" cy="0" rx="1.3" ry="5" fill="#E8F6FF" />
            </g>
          </svg>
        </span>
      ))}
    </>
  );
}

function RockColumn({ blobs, side }: { blobs: RockBlobs; side: 'left' | 'right' }) {
  return (
    <svg className={`scenery-column scenery-column-${side}`} viewBox="0 0 320 1000" preserveAspectRatio="xMinYMid slice">
      <g fill="#1F4677" opacity="0.55">
        {blobs.far.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g fill="#14305A" stroke="#3A6EA5" strokeWidth="3" strokeOpacity="0.4">
        {blobs.mid.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g fill="none" stroke="#2C5A8C" strokeWidth="2.5" strokeOpacity="0.35">
        {blobs.mid.map(([cx, cy, r], i) => (
          <path key={i} d={`M${cx - r * 0.55} ${cy + r * 0.1}A${r * 0.6} ${r * 0.6} 0 0 1 ${cx + r * 0.55} ${cy + r * 0.1}`} />
        ))}
      </g>
      <g fill="#0B1C36" stroke="#24507F" strokeWidth="3" strokeOpacity="0.55">
        {blobs.near.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </svg>
  );
}

function Platform({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 160 90">
      <path
        fill="#14305A"
        d="M10 30C10 18 26 14 34 20C40 10 58 10 64 18C72 8 92 10 96 18C104 10 124 12 128 20C138 14 152 20 150 32C150 46 130 56 112 62C100 74 84 80 76 70C62 76 46 70 40 62C24 58 10 46 10 30Z"
      />
      <path fill="#0B1C36" d="M14 40C30 52 60 58 90 56C116 54 136 46 148 40C142 50 128 58 112 62C100 74 84 80 76 70C62 76 46 70 40 62C26 58 18 50 14 40Z" />
      <path
        fill="none"
        stroke="#5B92CC"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
        d="M14 26C16 18 28 16 34 22M40 16C46 10 58 12 63 18M70 14C78 8 92 12 96 18M102 15C110 10 124 14 127 21M132 20C140 17 148 22 148 28"
      />
      <path fill="none" stroke="#14305A" strokeWidth="2.5" strokeLinecap="round" d="M58 70Q56 80 60 86M96 66Q100 76 96 84" />
    </svg>
  );
}
