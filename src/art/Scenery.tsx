import { useId } from 'react';
import type { Theme } from '../types';
import './scenery.css';

/** Full-viewport decorative backdrop. Detail lives near the top/bottom edges so the centre stays calm. */
export function Scenery({ theme }: { theme: Theme }) {
  return (
    <div className={`scenery scenery-${theme}`} aria-hidden="true">
      {theme === 'light' ? <Valley /> : <Cavern />}
    </div>
  );
}

/* ================= light: Howl's valley with Totoro in front ================= */

const CUMULUS: readonly Blob[] = [
  [70, 170, 46],
  [120, 140, 56],
  [180, 104, 70],
  [236, 72, 62],
  [292, 110, 60],
  [340, 150, 48],
  [376, 178, 30],
  [30, 188, 28],
  [150, 182, 46],
  [200, 150, 60],
  [252, 178, 52],
  [312, 188, 38],
];

const CLOUDS = [
  { left: '-12%', top: '-5%', width: 'clamp(240px, 44vw, 680px)', duration: 70, delay: -20 },
  { left: '60%', top: '1%', width: 'clamp(220px, 40vw, 620px)', duration: 84, delay: -50 },
  { left: '34%', top: '17%', width: 'clamp(120px, 19vw, 300px)', duration: 60, delay: -10 },
  { left: '-6%', top: '29%', width: 'clamp(140px, 23vw, 340px)', duration: 76, delay: -35 },
];

const BIRDS = [
  { top: '11%', size: 26, duration: 46, delay: -6 },
  { top: '20%', size: 18, duration: 58, delay: -30 },
];

const SEEDS = [
  { left: '8%', top: '70%', duration: 22, delay: -4 },
  { left: '24%', top: '82%', duration: 27, delay: -15 },
  { left: '44%', top: '76%', duration: 24, delay: -9 },
  { left: '14%', top: '58%', duration: 30, delay: -21 },
  { left: '60%', top: '88%', duration: 26, delay: -12 },
];

const SHEEP: readonly (readonly [number, number])[] = [
  [520, 262],
  [566, 276],
  [610, 256],
  [652, 272],
  [700, 258],
  [742, 280],
];

/** Short grass strokes scattered over the near hill, fixed by seed so they never jump between renders. */
const GRASS_STROKES = (() => {
  const r = rng(91);
  return Array.from({ length: 80 }, () => [Math.round(r() * 1440), Math.round(190 + r() * 200), r() < 0.5] as const);
})();

function Valley() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const farHill = `scenery-farhill${uid}`;
  const nearHill = `scenery-nearhill${uid}`;
  const haze = `scenery-haze${uid}`;
  return (
    <>
      {CLOUDS.map((c, i) => (
        <svg
          key={i}
          className="scenery-cumulus"
          viewBox="0 0 400 230"
          style={{ left: c.left, top: c.top, width: c.width, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
        >
          <ellipse cx="200" cy="212" rx="176" ry="14" fill="#C9D6E2" />
          <g fill="#DCE6EE">
            {CUMULUS.map(([cx, cy, r], j) => (
              <circle key={j} cx={cx} cy={cy} r={r} />
            ))}
            <ellipse cx="200" cy="204" rx="180" ry="16" />
          </g>
          <g fill="#FFFFFF">
            {CUMULUS.map(([cx, cy, r], j) => (
              <circle key={j} cx={cx - r * 0.12} cy={cy - r * 0.2} r={r * 0.84} />
            ))}
          </g>
        </svg>
      ))}

      {BIRDS.map((b, i) => (
        <span
          key={i}
          className="scenery-bird"
          style={{ top: b.top, width: b.size, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
        >
          <svg className="scenery-bird-wings" viewBox="0 0 24 10" style={{ animationDelay: `${-i * 0.3}s` }}>
            <path d="M1 7Q6 0 12 6Q18 0 23 7" fill="none" stroke="#2F3E4A" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      ))}

      <svg className="scenery-layer scenery-far" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id={farHill} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A6D65A" />
            <stop offset="1" stopColor="#7BC043" />
          </linearGradient>
          <filter id={haze} x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <g transform="translate(0 520) scale(1 1.25) translate(0 -520)">
          <g fill="#8C98A6">
            <path d="M120 520L190 380L230 400L290 270L320 290L350 240L390 300L430 330L470 400L520 520Z" />
            <path d="M560 520L640 400L690 420L760 280L800 300L850 190L880 170L910 200L950 180L990 260L1030 290L1080 380L1150 520Z" />
            <path d="M1100 520L1170 390L1210 410L1270 300L1300 320L1340 260L1380 300L1440 280V520Z" />
          </g>
          <g fill="#6A7686">
            <path d="M350 240L390 300L430 330L470 400L520 520L400 520L380 380Z" />
            <path d="M880 170L910 200L950 180L990 260L1030 290L1080 380L1150 520L960 520L930 340L900 250Z" />
            <path d="M1340 260L1380 300L1440 280V520L1360 520L1350 380Z" />
          </g>
          <g fill="#F4F6F8">
            <path d="M290 270L320 290L350 240L390 300L372 312L354 288L336 318L314 302L298 322Z" />
            <path d="M760 280L800 300L850 190L880 170L910 200L950 180L990 260L970 270L948 232L930 266L906 242L888 288L866 252L842 302L816 320L790 312Z" />
            <path d="M1270 300L1300 320L1340 260L1380 300L1440 280V310L1410 318L1384 330L1360 300L1340 326L1316 316L1290 336Z" />
          </g>
          <g fill="#CBD4DE">
            <path d="M350 240L390 300L372 312L360 290Z" />
            <path d="M880 170L910 200L950 180L990 260L970 270L948 232L930 266L906 242L896 230Z" />
            <path d="M1340 260L1380 300L1440 280V310L1410 318L1384 330L1360 300L1352 290Z" />
          </g>
          <path
            fill="none"
            stroke="#7A8696"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.55"
            d="M800 330L782 380M760 360L748 410M1010 300L1030 350M340 330L330 380M246 420L238 460M1220 420L1210 460"
          />
        </g>
        <g filter={`url(#${haze})`}>
          <g fill="#DCE6EE">
            <circle cx="260" cy="530" r="80" />
            <circle cx="700" cy="480" r="90" />
            <circle cx="940" cy="480" r="100" />
            <circle cx="1180" cy="480" r="100" />
            <circle cx="1420" cy="490" r="80" />
          </g>
          <g fill="#FFFFFF">
            <circle cx="60" cy="500" r="70" />
            <circle cx="170" cy="470" r="60" />
            <circle cx="250" cy="510" r="78" />
            <circle cx="420" cy="480" r="60" />
            <circle cx="560" cy="500" r="70" />
            <circle cx="690" cy="462" r="86" />
            <circle cx="820" cy="436" r="78" />
            <circle cx="930" cy="458" r="96" />
            <circle cx="1060" cy="424" r="88" />
            <circle cx="1170" cy="458" r="96" />
            <circle cx="1300" cy="440" r="88" />
            <circle cx="1420" cy="470" r="78" />
            <rect x="-20" y="490" width="1480" height="90" />
          </g>
        </g>
        <path fill={`url(#${farHill})`} d="M0 700V470C200 482 400 520 620 556C820 588 1100 590 1440 568V700Z" />
        <path
          fill="none"
          stroke="#C2E57A"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
          d="M40 486q6-8 14-10M180 500q6-8 14-10M330 520q6-8 14-10M520 548q6-8 14-10M760 580q6-8 14-10M1020 586q6-8 14-10M1260 576q6-8 14-10"
        />
      </svg>

      <div className="scenery-castle">
        <WalkingCastle />
        <span className="scenery-smoke" style={{ left: '68%', top: '5%', animationDelay: '0s' }} />
        <span className="scenery-smoke" style={{ left: '68%', top: '5%', animationDelay: '-3.5s' }} />
        <span className="scenery-smoke" style={{ left: '79%', top: '11%', animationDelay: '-1.8s' }} />
        <span className="scenery-smoke" style={{ left: '79%', top: '11%', animationDelay: '-5.3s' }} />
      </div>

      <svg className="scenery-layer scenery-near" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id={nearHill} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A6D65A" />
            <stop offset="0.35" stopColor="#7BC043" />
            <stop offset="1" stopColor="#5DA832" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${nearHill})`}
          d="M0 400V150C160 120 320 110 480 130C640 150 760 170 900 160C1080 146 1260 120 1440 140V400Z"
        />
        <path
          fill="none"
          stroke="#C2E57A"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.75"
          d="M30 150C160 124 320 116 470 134M940 158C1080 146 1240 126 1400 142"
        />
        {GRASS_STROKES.map(([x, y, light], i) => (
          <path
            key={i}
            d={`M${x} ${y}q2-7 6-11`}
            fill="none"
            stroke={light ? '#A6D65A' : '#4E9A2E'}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        ))}
        <g fill="#C9CCC4">
          <ellipse cx="300" cy="214" rx="7" ry="4" />
          <ellipse cx="860" cy="230" rx="6" ry="3.5" />
          <ellipse cx="1010" cy="200" rx="8" ry="4.5" />
          <ellipse cx="180" cy="250" rx="6" ry="3.5" />
        </g>
        <Cottage x={650} y={200} />
        {SHEEP.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${i % 2 ? -1 : 1} 1)`}>
            <g className="scenery-sheep" style={{ animationDuration: `${3 + (i % 3)}s`, animationDelay: `${-i * 0.9}s` }}>
              <path d="M-4 6V12M4 6V12M10 6V12" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="3" cy="3" rx="13" ry="7.5" fill="#DAD6CB" />
              <g fill="#F8F6EF">
                <circle cx="-5" cy="-1" r="6" />
                <circle cx="2" cy="-3" r="7" />
                <circle cx="9" cy="-1" r="6" />
                <circle cx="3" cy="1.5" r="6.5" />
              </g>
              <ellipse cx="-12" cy="1" rx="4" ry="5" fill="#4A4A4A" />
            </g>
          </g>
        ))}
        <path fill="#5DA832" d="M0 400V300C200 270 420 280 640 310C860 340 1100 300 1440 280V400Z" />
        <path fill="#3F7F2A" d="M0 400V360C240 340 520 350 760 372C1000 392 1240 360 1440 350V400Z" />
      </svg>

      <svg className="scenery-tuft" viewBox="0 0 260 170">
        <path fill="#3E7048" d="M0 170V118C30 96 70 92 110 112C140 100 180 108 200 130C222 126 250 140 260 170Z" />
        <path fill="#557F4B" d="M10 120C34 104 66 102 96 116C80 112 40 112 10 126Z" />
        {BLADE_GROUPS.map((x, g) => (
          <g key={g} className="scenery-blades" style={{ animationDuration: `${4 + g * 0.7}s`, animationDelay: `${-g * 1.3}s` }}>
            {[0, 1, 2, 3, 4].map((k) => {
              const bx = x + k * 9 - 18;
              const lean = (k - 2) * 6 + 4;
              const top = 50 + ((k + g) % 3) * 18;
              return (
                <path
                  key={k}
                  fill={BLADE_TONES[(k + g) % 3]}
                  d={`M${bx} 170Q${bx + lean * 0.4} 120 ${bx + lean} ${top}Q${bx + 6} 120 ${bx + 8} 170Z`}
                />
              );
            })}
          </g>
        ))}
        <g fill="#FFFFFF">
          <circle cx="58" cy="104" r="5" />
          <circle cx="132" cy="96" r="4.5" />
          <circle cx="196" cy="118" r="4" />
        </g>
        <g fill="#F5D547">
          <circle cx="58" cy="104" r="2" />
          <circle cx="132" cy="96" r="1.8" />
          <circle cx="196" cy="118" r="1.6" />
        </g>
      </svg>

      <ForestSpirit />

      {SEEDS.map((s, i) => (
        <svg
          key={i}
          className="scenery-seed"
          viewBox="-10 -10 20 26"
          style={{ left: s.left, top: s.top, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }}
        >
          <path d="M0 0V14" stroke="#EDE7D2" strokeWidth="1.2" strokeLinecap="round" />
          <path
            d="M0 0L0-8M0 0L6-6M0 0L8 0M0 0L6 6M0 0L-6 6M0 0L-8 0M0 0L-6-6"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle r="1.6" fill="#FFFFFF" />
        </svg>
      ))}
    </>
  );
}

const BLADE_GROUPS = [30, 90, 150, 214];
const BLADE_TONES = ['#5DA832', '#7BC043', '#3F7F2A'];

/** Thatched stone cottage with a little barn and a dry-stone wall; base line sits at (x, y). */
function Cottage({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-170" y="-16" width="100" height="16" rx="3" fill="#CFC6B4" />
      <path d="M-160-8H-140M-130-12H-110M-100-6H-82M-150-2H-126" stroke="#A89E8A" strokeWidth="2" strokeLinecap="round" />
      <rect x="-66" y="-30" width="52" height="30" fill="#D8CFBE" />
      <path d="M-70-28L-40-52L-10-28Z" fill="#7A5A48" />
      <rect x="-46" y="-20" width="10" height="20" fill="#6B5040" />
      <rect x="58" y="-80" width="11" height="26" fill="#B8B0A2" />
      <rect x="56" y="-84" width="15" height="6" rx="1.5" fill="#9E968A" />
      <rect x="0" y="-40" width="100" height="40" fill="#EDE6D6" />
      <g fill="#C9C0AE">
        <rect x="8" y="-12" width="12" height="6" rx="2" />
        <rect x="78" y="-10" width="14" height="6" rx="2" />
        <rect x="52" y="-30" width="10" height="5" rx="2" />
      </g>
      <rect x="66" y="-28" width="12" height="10" fill="#4A4038" />
      <rect x="30" y="-28" width="14" height="28" fill="#6B5040" />
      <path d="M-8-36C-4-62 20-78 50-80C80-78 104-62 108-36C80-43 20-43-8-36Z" fill="#D3A85E" />
      <path
        d="M-8-36C20-43 80-43 108-36M10-50C30-58 70-58 90-50M30-66C42-70 58-70 70-66"
        fill="none"
        stroke="#B08A44"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  );
}

/** An original clanking walking fortress: rusty turrets, slate roofs, stuck-on cottages, spindly legs. */
function WalkingCastle() {
  return (
    <svg className="scenery-castle-body" viewBox="0 0 240 250">
      <g fill="none" stroke="#5A4A4A" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M88 178L76 208L90 236L80 246M108 182L112 212L102 246M144 182L154 212L146 246M164 176L182 206L172 236L182 246" />
      </g>
      <path fill="#5A4A4A" d="M150 72L156 14H166L164 78ZM172 80L186 26L195 28L184 86Z" />
      <path fill="#6E6A72" d="M152 9H170V17H152ZM181 21L198 25L196 33L179 29Z" />
      <path
        fill="#7A4A3A"
        d="M36 160L30 132L44 118L40 98L58 90L62 70L84 66L92 50L112 54L124 40L146 52L168 60L176 80L198 88L206 112L214 134L204 160C180 178 140 186 112 184C80 184 52 176 36 160Z"
      />
      <path fill="#5A4A4A" d="M40 160C66 178 170 182 204 160C196 176 150 188 112 186C78 188 52 178 40 160Z" />
      <path fill="#9C5E46" d="M50 134H84V116H66V104H50ZM150 140H190V118H172V108H150ZM96 122H124V104H96Z" />
      <rect x="60" y="48" width="22" height="44" rx="3" fill="#9C5E46" />
      <rect x="104" y="28" width="24" height="56" rx="3" fill="#7A4A3A" />
      <rect x="178" y="70" width="18" height="30" rx="2" fill="#9C5E46" />
      <g fill="#6E6A72">
        <path d="M56 50L71 26L86 50Z" />
        <path d="M100 30L116 4L132 30Z" />
        <path d="M174 72L187 54L200 72Z" />
        <path d="M24 106L40 92L56 106Z" />
        <path d="M182 102L197 90L212 102Z" />
      </g>
      <path d="M116 4V-4M71 26V20" stroke="#5A4A4A" strokeWidth="2" />
      <g fill="#F2E2C4">
        <rect x="28" y="104" width="24" height="18" />
        <rect x="186" y="100" width="22" height="16" />
        <rect x="130" y="62" width="20" height="16" />
      </g>
      <path fill="#9C5E46" d="M126 64L140 50L154 64Z" />
      <g fill="#4A3A36">
        <rect x="33" y="109" width="5" height="6" />
        <rect x="43" y="109" width="5" height="6" />
        <rect x="192" y="105" width="5" height="5" />
        <rect x="137" y="67" width="5" height="6" />
      </g>
      <g fill="#F2E2C4">
        <rect x="68" y="58" width="6" height="8" />
        <rect x="68" y="74" width="6" height="8" />
        <rect x="113" y="40" width="7" height="9" />
        <rect x="113" y="58" width="7" height="9" />
        <rect x="184" y="80" width="6" height="7" />
        <rect x="104" y="110" width="6" height="6" />
        <rect x="160" y="124" width="7" height="6" />
        <rect x="58" y="120" width="6" height="6" />
      </g>
      <path fill="#3A3436" d="M76 156Q110 166 150 158L148 168Q110 176 78 166Z" />
      <path d="M90 160V168M102 162V171M114 163V172M126 162V171M138 160V169" stroke="#F2E2C4" strokeWidth="2.2" />
      <path fill="#5A4A4A" d="M48 140L24 146L25 153L49 147Z" />
      <circle cx="58" cy="142" r="11" fill="#6E6A72" />
      <circle cx="58" cy="142" r="4.5" fill="#3A3436" />
      <circle cx="186" cy="146" r="9" fill="#6E6A72" />
      <circle cx="186" cy="146" r="3.6" fill="#3A3436" />
      <path
        d="M62 92C90 84 130 82 170 90M44 132C80 140 150 144 206 134M96 104C110 98 140 98 150 108"
        fill="none"
        stroke="#4A3A36"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

const CHEVRONS: readonly (readonly [number, number])[] = [
  [126, 184],
  [150, 178],
  [174, 184],
  [114, 208],
  [138, 202],
  [162, 202],
  [186, 208],
];

/** Big grey forest spirit standing in a bush at the bottom-right; blinks and twitches now and then. */
function ForestSpirit() {
  const ink = '#3A3A40';
  const fur = '#8E8F94';
  return (
    <svg className="scenery-totoro" viewBox="0 0 300 360">
      <g fill={fur} stroke={ink} strokeWidth="3" strokeLinejoin="round">
        <path className="scenery-totoro-ear scenery-totoro-ear-l" d="M104 98C96 70 96 46 104 24C112 42 120 64 124 90Z" />
        <path className="scenery-totoro-ear scenery-totoro-ear-r" d="M196 98C204 70 204 46 196 24C188 42 180 64 176 90Z" />
        <path d="M150 70C190 70 214 94 220 132C228 182 240 232 246 290H54C60 232 72 182 80 132C86 94 110 70 150 70Z" />
      </g>
      <path d="M112 86C124 78 140 75 152 76" fill="none" stroke="#A3A4A9" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="150" cy="232" rx="64" ry="70" fill="#F1EAD6" />
      <g fill="#6F7076">
        {CHEVRONS.map(([cx, cy], i) => (
          <path key={i} d="M-9 5Q0-7 9 5Q0 0-9 5Z" transform={`translate(${cx} ${cy})`} />
        ))}
      </g>
      <g fill="#85868B" stroke={ink} strokeWidth="3" strokeLinejoin="round">
        <path d="M82 146C68 176 62 206 68 236C74 244 84 240 86 232C86 204 90 176 94 152Z" />
        <path d="M218 146C232 176 238 206 232 236C226 244 216 240 214 232C214 204 210 176 206 152Z" />
      </g>
      <g fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round">
        <g className="scenery-totoro-whisker scenery-totoro-whisker-l">
          <path d="M98 120L48 106M98 128L44 128M100 136L50 150" />
        </g>
        <g className="scenery-totoro-whisker scenery-totoro-whisker-r">
          <path d="M202 120L252 106M202 128L256 128M200 136L250 150" />
        </g>
      </g>
      <g fill="#FFFDF5" stroke={ink} strokeWidth="3">
        <circle cx="122" cy="112" r="12.5" />
        <circle cx="178" cy="112" r="12.5" />
      </g>
      <circle cx="124" cy="113" r="4.6" fill={ink} />
      <circle cx="176" cy="113" r="4.6" fill={ink} />
      <g className="scenery-totoro-lids" fill={fur} stroke={ink} strokeWidth="3" strokeLinecap="round">
        <circle cx="122" cy="112" r="13.5" />
        <circle cx="178" cy="112" r="13.5" />
        <path d="M110 114Q122 120 134 114M166 114Q178 120 190 114" fill="none" />
      </g>
      <path d="M141 101Q150 96 159 101Q150 109 141 101Z" fill={ink} />
      <path d="M106 128C126 147 174 147 194 128C188 166 112 166 106 128Z" fill="#FFFDF5" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M128 140V153M150 142V157M172 140V153" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      <path fill="#2F5A3A" d={BUSH_BACK} />
      <path fill="#3E7048" d={BUSH_MID} />
      <path d="M60 296q6-6 14-6M120 286q6-6 14-6M180 286q6-6 14-6M240 296q6-6 14-6" fill="none" stroke="#2F5A3A" strokeWidth="3" strokeLinecap="round" />
      <path fill="#557F4B" d={BUSH_FRONT} />
      <path
        d="M30 334q8-8 18-8M88 322q8-8 18-8M142 316q8-8 18-8M196 318q8-8 18-8M254 326q8-8 18-8"
        fill="none"
        stroke="#6E9A5E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M60 344q6-6 14-6M170 340q6-6 14-6M230 346q6-6 14-6" fill="none" stroke="#3E7048" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Scalloped foliage edge following the mound's crest, so the bush reads as leaves rather than balls. */
function bushPath(lift: number, step: number) {
  const crest = (x: number) => (x < 120 ? 256 + ((120 - x) / 120) ** 2 * 120 : 250 + ((x - 170) / 130) ** 2 * 30) + lift;
  const r = (step * 0.62).toFixed(1);
  let d = `M-20 360L-20 ${crest(-20).toFixed(1)}`;
  for (let x = -20; x < 320; x += step) d += `A${r} ${r} 0 0 1 ${x + step} ${crest(x + step).toFixed(1)}`;
  return `${d}L340 360Z`;
}

const BUSH_BACK = bushPath(-6, 22);
const BUSH_MID = bushPath(18, 18);
const BUSH_FRONT = bushPath(44, 15);

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
