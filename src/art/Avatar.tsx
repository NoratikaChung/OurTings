import { useId, type ReactNode } from 'react';
import { USER_NAMES, type Theme, type UserId } from '../types';
import totoroUrl from './avatar/totoro.jpg';
import whiteElfUrl from './avatar/white-elf.jpg';
import hornetUrl from './avatar/hornet.png';
import knightUrl from './avatar/knight.png';

interface AvatarProps {
  user: UserId;
  theme: Theme;
  size?: number;
}

/** Round character portrait: white elf and Totoro in light, Hornet and the Knight in a glowing cavern in dark. */
export function Avatar({ user, theme, size = 96 }: AvatarProps) {
  // useId output may contain characters that are awkward inside url(#…) references.
  const uid = `av${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const art: ReactNode =
    theme === 'light' ? (
      <Picture uid={uid} href={user === 'nora' ? whiteElfUrl : totoroUrl} />
    ) : (
      <Cavern uid={uid}>{user === 'nora' ? <Hornet /> : <Knight />}</Cavern>
    );
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={USER_NAMES[user]}>
      {art}
    </svg>
  );
}

/* ---------- light: the user's Totoro and white elf pictures, cut to a circle ---------- */

function Picture({ uid, href }: { uid: string; href: string }) {
  const clip = `${uid}-disc`;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <image href={href} width="100" height="100" clipPath={`url(#${clip})`} />
    </>
  );
}

/* ---------- dark: cavern frame shared by the Knight and Hornet ---------- */

function Cavern({ uid, children }: { uid: string; children: ReactNode }) {
  const bg = `${uid}-bg`;
  const halo = `${uid}-halo`;
  const blur = `${uid}-blur`;
  const clip = `${uid}-clip`;
  return (
    <>
      <defs>
        <radialGradient id={bg} cx="50%" cy="42%" r="62%">
          <stop offset="0" stopColor="#1E4B80" />
          <stop offset="0.6" stopColor="#0E2240" />
          <stop offset="1" stopColor="#0A1932" />
        </radialGradient>
        <radialGradient id={halo} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#BFE6FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#BFE6FF" stopOpacity="0" />
        </radialGradient>
        <filter id={blur} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${bg})`} />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#BFE6FF" strokeWidth="3" opacity="0.6" filter={`url(#${blur})`} />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#BFE6FF" strokeWidth="0.8" opacity="0.45" />
      <circle cx="50" cy="48" r="34" fill={`url(#${halo})`} />
      <g fill="#E8F6FF">
        <circle cx="19" cy="34" r="1.3" opacity="0.8" />
        <circle cx="82" cy="28" r="1" opacity="0.7" />
        <circle cx="84" cy="60" r="1.4" opacity="0.8" />
      </g>
      <g clipPath={`url(#${clip})`}>{children}</g>
    </>
  );
}

const INK = '#05070D';

/** Drawn cloak under the user's mask picture (knight.png is 293×320). */
function Knight() {
  return (
    <>
      <path d="M23 101C25 87 36 77 50 77C64 77 75 87 77 101Z" fill="#1E2840" stroke={INK} strokeWidth="3" />
      <path d="M43 80L37 101M50 81V101M57 80L63 101" stroke="#6B7C9E" strokeWidth="2.4" strokeLinecap="round" />
      <image href={knightUrl} x="21.5" y="16" width="57" height="62.25" />
    </>
  );
}

/** Drawn cloak and ruff under the user's mask picture (hornet.png is 200×320). */
function Hornet() {
  return (
    <>
      <path d="M33 101C34 92 40 83 50 81C60 83 66 92 67 101Z" fill="#9A5A6A" stroke={INK} strokeWidth="3" />
      <path d="M45 86L42 101M50 86V101M55 86L58 101" stroke="#6E3646" strokeWidth="2" strokeLinecap="round" />
      <path d="M41 88L45 81.5L50 84L55 81.5L59 88C55 86.5 45 86.5 41 88Z" fill="#B87888" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <image href={hornetUrl} x="29.5" y="15" width="41" height="65.6" />
    </>
  );
}
