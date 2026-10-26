import { useId } from 'react';
import type { Theme } from '../types';
import './scenery.css';

/** Full-viewport decorative backdrop. Detail lives near the top/bottom edges so the centre stays calm. */
export function Scenery({ theme }: { theme: Theme }) {
  return (
    <div className={`scenery scenery-${theme}`} aria-hidden="true">
      {theme === 'light' ? <Meadow /> : <Cavern />}
    </div>
  );
}

/* ================= light: pink-tree meadow ================= */

const CLOUDS = [
  { left: '3%', top: '6%', width: 'clamp(110px, 17vw, 240px)', duration: 46, delay: -8 },
  { left: '70%', top: '3%', width: 'clamp(90px, 13vw, 190px)', duration: 58, delay: -30 },
  { left: '38%', top: '15%', width: 'clamp(70px, 9vw, 130px)', duration: 40, delay: -18 },
  { left: '84%', top: '24%', width: 'clamp(60px, 8vw, 120px)', duration: 52, delay: -4 },
  { left: '-2%', top: '29%', width: 'clamp(60px, 7vw, 110px)', duration: 62, delay: -40 },
];

const HEARTS = [
  { left: '18%', top: '19%', size: 'clamp(14px, 2vw, 26px)', tone: 'rose', duration: 7, delay: 0 },
  { left: '62%', top: '11%', size: 'clamp(12px, 1.6vw, 22px)', tone: 'rose', duration: 9, delay: -3 },
  { left: '90%', top: '14%', size: 'clamp(16px, 2.4vw, 30px)', tone: 'rose', duration: 8, delay: -5 },
  { left: '6%', top: '52%', size: 'clamp(26px, 4vw, 54px)', tone: 'pale', duration: 10, delay: -2 },
  { left: '84%', top: '47%', size: 'clamp(30px, 4.6vw, 64px)', tone: 'pale', duration: 11, delay: -6 },
  { left: '48%', top: '64%', size: 'clamp(22px, 3vw, 40px)', tone: 'pale', duration: 9, delay: -1 },
];

function Meadow() {
  return (
    <>
      {CLOUDS.map((c, i) => (
        <svg
          key={i}
          className="scenery-cloud"
          viewBox="0 0 200 92"
          style={{ left: c.left, top: c.top, width: c.width, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
        >
          <g fill="#F9D3D8" transform="translate(0 5)">
            <circle cx="52" cy="62" r="30" />
            <circle cx="96" cy="50" r="38" />
            <circle cx="142" cy="60" r="31" />
            <ellipse cx="100" cy="78" rx="88" ry="14" />
          </g>
          <g fill="#FFFFFF">
            <circle cx="50" cy="56" r="28" />
            <circle cx="94" cy="43" r="36" />
            <circle cx="140" cy="54" r="29" />
            <circle cx="172" cy="66" r="17" />
            <circle cx="24" cy="68" r="15" />
            <ellipse cx="100" cy="72" rx="86" ry="13" />
          </g>
        </svg>
      ))}

      <svg className="scenery-layer scenery-mountains" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
        <path
          fill="#F9DCD2"
          d="M0 600V250L110 178Q132 160 152 178L270 282L392 140Q414 118 436 140L560 268L690 176Q712 160 734 176L850 262L996 116Q1020 94 1044 116L1188 250L1300 170Q1322 154 1344 170L1440 232V600Z"
        />
        <path
          fill="#FBE7E0"
          d="M392 140Q414 118 436 140L560 268L500 250L430 200ZM996 116Q1020 94 1044 116L1188 250L1120 236L1030 170ZM110 178Q132 160 152 178L270 282L210 262L140 206Z"
        />
        <path
          fill="#F5C7BA"
          d="M0 600V352C70 322 130 300 200 326C252 290 330 286 382 318C450 270 560 264 620 314C690 284 760 290 812 322C880 276 990 270 1050 318C1110 290 1190 292 1240 324C1300 296 1380 300 1440 330V600Z"
        />
        <path
          fill="#EFB3A6"
          d="M0 600V440C90 410 170 404 240 430C330 392 440 394 520 428C610 400 700 402 760 432C850 396 960 396 1040 430C1120 404 1220 404 1290 432C1350 414 1400 414 1440 424V600Z"
        />
      </svg>

      {HEARTS.map((h, i) => (
        <svg
          key={i}
          className={`scenery-heart scenery-heart-${h.tone}`}
          viewBox="-16 -14 32 32"
          style={{ left: h.left, top: h.top, width: h.size, animationDuration: `${h.duration}s`, animationDelay: `${h.delay}s` }}
        >
          <path d="M0-5C-4-12-15-11-15-2C-15 6-6 11 0 16C6 11 15 6 15-2C15-11 4-12 0-5Z" fill="currentColor" />
        </svg>
      ))}

      <svg className="scenery-trees scenery-trees-left" viewBox="0 0 600 700">
        <PinkTree x={470} y={700} scale={0.6} />
        <PinkTree x={220} y={700} scale={1} />
      </svg>
      <svg className="scenery-trees scenery-trees-right" viewBox="0 0 600 700">
        <PinkTree x={130} y={700} scale={0.66} flip />
        <PinkTree x={380} y={700} scale={0.94} flip />
      </svg>

      <svg className="scenery-branch" viewBox="0 0 400 260">
        <path
          fill="#8E5F3A"
          d="M400 18C340 28 290 58 240 88C210 106 180 118 150 124L153 133C186 129 220 117 250 101C300 75 350 50 400 44Z"
        />
        <path fill="none" stroke="#8E5F3A" strokeWidth="7" strokeLinecap="round" d="M298 66C288 90 292 110 300 128" />
        <path fill="none" stroke="#B9875A" strokeWidth="3" strokeLinecap="round" d="M380 30C330 42 290 64 250 88" />
        <Puff x={360} y={22} scale={1.25} />
        <Puff x={262} y={70} scale={1} />
        <Puff x={300} y={136} scale={0.62} />
        <Puff x={170} y={118} scale={0.8} />
      </svg>

      <svg className="scenery-layer scenery-hills" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice">
        <path
          fill="#A0567A"
          d="M0 260V128C40 110 90 84 120 76C136 72 146 78 160 88C200 116 230 140 250 150C290 128 330 104 360 98C376 96 390 104 410 118L470 170H980L1060 120C1080 100 1100 86 1116 84C1132 82 1150 98 1170 116L1220 150C1250 120 1290 80 1320 64C1336 58 1348 66 1360 74C1390 92 1420 104 1440 110V260Z"
        />
        <g fill="#F7B3C2">
          <circle cx="560" cy="150" r="34" />
          <circle cx="600" cy="132" r="40" />
          <circle cx="646" cy="150" r="32" />
          <circle cx="870" cy="146" r="30" />
          <circle cx="906" cy="130" r="34" />
        </g>
        <g fill="#FBCAD5">
          <circle cx="592" cy="122" r="22" />
          <circle cx="900" cy="122" r="18" />
        </g>
        <path
          fill="#8D6BB3"
          d="M0 260V146C60 118 140 116 190 150C240 120 320 116 372 150C420 132 480 136 520 160C580 140 660 144 700 170C760 146 840 146 880 168C930 142 1010 140 1060 162C1110 128 1190 124 1240 156C1300 128 1380 130 1440 150V260Z"
        />
        <path
          fill="#7A5AA0"
          d="M0 260V196C40 160 120 154 168 186C210 140 300 132 352 178C390 160 440 162 470 188C520 120 650 110 720 176C760 158 810 160 840 182C880 136 980 132 1030 182C1070 160 1120 162 1150 186C1200 146 1290 144 1330 186C1370 168 1410 170 1440 180V260Z"
        />
        <path
          fill="none"
          stroke="#9A7CC6"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
          d="M495 154C540 126 620 118 676 146M860 158C900 140 960 138 1000 160M185 160C220 144 280 140 322 160M1180 160C1220 148 1270 148 1305 164"
        />
        <path
          fill="#644585"
          d="M0 260V232C60 210 140 208 200 228C270 204 360 204 420 226C500 200 600 200 660 224C740 198 840 198 900 222C980 200 1080 200 1140 224C1210 204 1300 204 1360 222C1390 214 1420 214 1440 218V260Z"
        />
      </svg>
    </>
  );
}

const CANOPY: readonly (readonly [number, number, number])[] = [
  [-130, -235, 58],
  [-75, -210, 62],
  [-10, -200, 66],
  [60, -208, 62],
  [120, -232, 56],
  [-105, -290, 70],
  [-30, -300, 80],
  [50, -295, 78],
  [115, -285, 60],
  [-60, -355, 64],
  [20, -365, 66],
  [80, -340, 52],
];
const CANOPY_GLOW: readonly (readonly [number, number, number])[] = [
  [-72, -392, 15],
  [-2, -404, 17],
  [-124, -322, 12],
  [62, -374, 12],
  [-40, -330, 9],
];

/** Cotton-candy tree; trunk base sits at (x, y). */
function PinkTree({ x, y, scale, flip = false }: { x: number; y: number; scale: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <path
        fill="#8E5F3A"
        d="M-28 0C-18-50-12-100-28-150C-34-168-40-184-46-202L-20-210C-14-186-6-166 0-146C8-170 22-190 42-206L60-192C36-172 20-146 15-110C10-70 18-30 28 0Z"
      />
      <path fill="#74482A" d="M-28 0C-18-50-12-100-28-150C-34-168-40-184-46-202L-36-205C-26-170-12-140-10-100C-8-60-14-30-12 0Z" />
      <path
        fill="none"
        stroke="#B9875A"
        strokeWidth="5"
        strokeLinecap="round"
        d="M8-14C2-50 2-86-8-126M4-136C12-158 24-176 40-190M-24-160C-28-172-32-182-36-194"
      />
      <g fill="#F29BB2">
        {CANOPY.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g fill="#F7B3C2">
        {CANOPY.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx - 4} cy={cy - 14} r={r - 9} />
        ))}
      </g>
      <g fill="#FBCAD5">
        {CANOPY.filter(([, cy]) => cy < -250).map(([cx, cy, r], i) => (
          <circle key={i} cx={cx - 9} cy={cy - 26} r={r - 26} />
        ))}
      </g>
      <g fill="#FDE3EA">
        {CANOPY_GLOW.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </g>
  );
}

const PUFF: readonly (readonly [number, number, number])[] = [
  [-40, 6, 30],
  [0, 12, 34],
  [38, 4, 28],
  [-18, -22, 30],
  [20, -24, 30],
];

/** Small blossom cluster for the hanging branch. */
function Puff({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g fill="#F29BB2">
        {PUFF.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g fill="#F7B3C2">
        {PUFF.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx - 3} cy={cy - 8} r={r - 7} />
        ))}
      </g>
      <g fill="#FBCAD5">
        <circle cx="-22" cy="-32" r="14" />
        <circle cx="14" cy="-34" r="13" />
      </g>
      <circle cx="-26" cy="-38" r="6" fill="#FDE3EA" />
      <circle cx="8" cy="-40" r="5" fill="#FDE3EA" />
    </g>
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
