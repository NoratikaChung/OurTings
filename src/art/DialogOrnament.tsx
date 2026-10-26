import { useId } from 'react';

/** Semicircle arcs of shrinking radius along one horizontal line, i.e. a scroll curl. */
function curl(cx: number, cy: number, r: number, sweep: 0 | 1) {
  const xs = [cx + r, cx - r, cx + r * 0.5, cx - r * 0.2, cx + r * 0.06];
  let d = `M${xs[0]} ${cy}`;
  for (let i = 1; i < xs.length; i++) {
    const rr = Math.abs(xs[i] - xs[i - 1]) / 2;
    d += `A${rr} ${rr} 0 0 ${sweep} ${xs[i]} ${cy}`;
  }
  return d;
}

const TOP_RIGHT = [
  'M163 18C170 18 173 13 180 12C187 11 191 15 192 18',
  curl(198, 18, 6, 1),
  'M204 18C210 23 218 24 224 20',
  curl(230, 17, 6.5, 0),
  'M236 17C244 10 254 11 260 16C266 21 274 21 280 17',
  curl(284, 17, 4, 1),
].join('');

const BOTTOM_RIGHT = [
  'M111 15C117 15 120 10 126 10C131 10 134 13 135 16',
  curl(140, 16, 5, 1),
  'M145 16C152 21 160 21 166 17',
  curl(171, 16, 5, 0),
  'M176 16C182 13 188 13 192 15',
].join('');

/** White Hollow Knight–style dialog flourish; colour comes from `currentColor`, width from the container. */
export function DialogOrnament({ kind }: { kind: 'top' | 'bottom' }) {
  const clip = `ornament-seal${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const strokes = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' } as const;
  if (kind === 'bottom') {
    return (
      <svg viewBox="0 0 200 30" width="100%" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
        <path d={BOTTOM_RIGHT} {...strokes} />
        <path d={BOTTOM_RIGHT} {...strokes} transform="translate(200 0) scale(-1 1)" />
        <circle cx="194" cy="15" r="1.8" />
        <circle cx="6" cy="15" r="1.8" />
        <path d="M89 6C94 6 97 9 98 13L100 25L102 13C103 9 106 6 111 6C107 8 105 10 104 14L100 28L96 14C95 10 93 8 89 6Z" />
        <circle cx="100" cy="6" r="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 36" width="100%" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <clipPath id={clip}>
          <ellipse cx="150" cy="16" rx="8" ry="12" />
        </clipPath>
      </defs>
      <path d={TOP_RIGHT} {...strokes} />
      <path d={TOP_RIGHT} {...strokes} transform="translate(300 0) scale(-1 1)" />
      <circle cx="291" cy="17" r="2" />
      <circle cx="9" cy="17" r="2" />
      <path d="M216 7C219 5 223 6 224 9C220 10 217 9 216 7ZM84 7C81 5 77 6 76 9C80 10 83 9 84 7Z" />
      <path d="M248 27C251 29 255 28 256 25C252 24 249 25 248 27ZM52 27C49 29 45 28 44 25C48 24 51 25 52 27Z" />
      <g clipPath={`url(#${clip})`}>
        <rect x="140" y="3" width="20" height="5" />
        <rect x="140" y="10" width="20" height="5" />
        <rect x="140" y="17" width="20" height="5" />
        <rect x="140" y="24" width="20" height="5" />
      </g>
      <path d="M146 27.5L150 34L154 27.5Z" />
      <circle cx="150" cy="2.2" r="1.6" />
      <path d="M141 16C137 13 133 14 132 18M159 16C163 13 167 14 168 18" {...strokes} strokeWidth="1.8" />
    </svg>
  );
}
