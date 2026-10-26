import { useId, type ReactNode } from 'react';
import { USER_NAMES, type Theme, type UserId } from '../types';

interface AvatarProps {
  user: UserId;
  theme: Theme;
  size?: number;
}

/** Round character portrait: kawaii calico cat / bunny in light, little bug knights in dark. */
export function Avatar({ user, theme, size = 96 }: AvatarProps) {
  // useId output may contain characters that are awkward inside url(#…) references.
  const uid = `av${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const art: ReactNode =
    theme === 'light' ? (
      user === 'nora' ? <Cat uid={uid} /> : <Bunny />
    ) : (
      <Cavern uid={uid}>{user === 'nora' ? <Hornet /> : <Knight />}</Cavern>
    );
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={USER_NAMES[user]}>
      {art}
    </svg>
  );
}

/* ---------- light: calico cat ---------- */

const CAT_INK = '#4A2E2A';
const CAT_HEAD = 'M50 34C71 34 85 45 85 62C85 78 71 86 50 86C29 86 15 78 15 62C15 45 29 34 50 34Z';
const CAT_EAR_L = 'M20 56C17 44 16 30 19 21C20.5 16.5 24.5 15 28.5 17.5C35 21.5 41 28 47 37Z';
const CAT_EAR_R = 'M80 56C83 44 84 30 81 21C79.5 16.5 75.5 15 71.5 17.5C65 21.5 59 28 53 37Z';

function Cat({ uid }: { uid: string }) {
  const clip = `${uid}-head`;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path d={CAT_HEAD} />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill="#FBD3DC" />
      <g stroke={CAT_INK} strokeWidth="3.6" strokeLinejoin="round">
        <path d={CAT_EAR_L} fill="#F0A35E" />
        <path d={CAT_EAR_R} fill="#3B2A26" />
      </g>
      <path d="M23.5 39C22.5 32.5 23 27 25 23.5C29.5 25 34 29 37.5 34Z" fill="#F7B6C8" />
      <path d="M76.5 39C77.5 32.5 77 27 75 23.5C70.5 25 66 29 62.5 34Z" fill="#F7B6C8" />
      <path d={CAT_HEAD} fill="#FFFFFF" />
      <g clipPath={`url(#${clip})`}>
        <path
          d="M8 28H47C48.5 37 44.5 42 46.5 48C48.5 55 43 63.5 34 63.5C27.5 63.5 23 59.5 18 62.5L8 63Z"
          fill="#F0A35E"
        />
        <path d="M62 28H92V47C86 50 81 45.5 75.5 46.5C69 47.5 63 44 63 39C63 34.5 65 31.5 62 28Z" fill="#3B2A26" />
      </g>
      <path d={CAT_HEAD} fill="none" stroke={CAT_INK} strokeWidth="3.6" />
      <g stroke={CAT_INK} strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M14 61.5L5 59.5M14.5 67.5L6 69.5M86 61.5L95 59.5M85.5 67.5L94 69.5" />
        <path d="M50 64.5V67.5M44.5 67C46 71.5 49 71.5 50 67.5C51 71.5 54 71.5 55.5 67" strokeWidth="2.6" />
      </g>
      <ellipse cx="29.5" cy="70" rx="5.5" ry="3" fill="#F6A3BA" />
      <ellipse cx="70.5" cy="70" rx="5.5" ry="3" fill="#F6A3BA" />
      <circle cx="36.5" cy="61" r="4.3" fill={CAT_INK} />
      <circle cx="63.5" cy="61" r="4.3" fill={CAT_INK} />
      <circle cx="37.9" cy="59.5" r="1.3" fill="#FFFFFF" />
      <circle cx="64.9" cy="59.5" r="1.3" fill="#FFFFFF" />
    </>
  );
}

/* ---------- light: bunny ---------- */

const BUNNY_INK = '#2A2321';
const BUNNY_FACE = 'M50 40C72 40 87 55 87 70C87 82 72 88 50 88C28 88 13 82 13 70C13 55 28 40 50 40Z';

function Bunny() {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill="#AEEBD9" />
      <g stroke={BUNNY_INK} strokeWidth="3.6" fill="#FFF8EE">
        <ellipse cx="36" cy="31" rx="9.5" ry="22" transform="rotate(-9 36 31)" />
        <ellipse cx="64" cy="31" rx="9.5" ry="22" transform="rotate(9 64 31)" />
      </g>
      <ellipse cx="36.5" cy="31" rx="5" ry="15" transform="rotate(-9 36 31)" fill="#FBE3D2" />
      <ellipse cx="63.5" cy="31" rx="5" ry="15" transform="rotate(9 64 31)" fill="#FBE3D2" />
      <path d={BUNNY_FACE} fill="#FFF8EE" stroke={BUNNY_INK} strokeWidth="3.6" />
      <circle cx="27.5" cy="71.5" r="5.8" fill="#F9B7B3" />
      <circle cx="72.5" cy="71.5" r="5.8" fill="#F9B7B3" />
      <circle cx="37.5" cy="65" r="3.8" fill={BUNNY_INK} />
      <circle cx="62.5" cy="65" r="3.8" fill={BUNNY_INK} />
      <path
        d="M44 68C45 72.5 49 73 50 68.5C51 73 55 72.5 56 68"
        fill="none"
        stroke={BUNNY_INK}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

const SHELL = '#F5F9FD';
const SHELL_SHADE = '#D5E2F0';
const VOID = '#080C18';

function Knight() {
  return (
    <>
      <path d="M27 101C27 88 37 77 50 77C63 77 73 88 73 101Z" fill="#2B3446" />
      <path d="M50 77C57 77 63 80 67 86L58 101H50Z" fill="#3A4560" />
      <path d="M38 101L44 80M56 80L62 101" stroke="#1D2433" strokeWidth="1.6" />
      <path
        d="M37 41C33.5 34.5 33 27 31.5 21C30.5 16.5 28 13.5 24.5 11.5C29.5 10.5 34.5 13.5 37 19C39.5 25 40.5 31 45 37Z"
        fill={SHELL}
      />
      <path
        d="M63 41C66.5 34.5 67 27 68.5 21C69.5 16.5 72 13.5 75.5 11.5C70.5 10.5 65.5 13.5 63 19C60.5 25 59.5 31 55 37Z"
        fill={SHELL}
      />
      <path d="M50 33C65 33 75 42 75 55C75 68 64 79 50 79C36 79 25 68 25 55C25 42 35 33 50 33Z" fill={SHELL} />
      <path d="M71 49C73 61 66 74 52 77.5C66 78 76 67 75 54C74.6 52.2 73 50.2 71 49Z" fill={SHELL_SHADE} />
      <ellipse cx="39.5" cy="57" rx="7.2" ry="10" transform="rotate(-12 39.5 57)" fill={VOID} />
      <ellipse cx="60.5" cy="57" rx="7.2" ry="10" transform="rotate(12 60.5 57)" fill={VOID} />
    </>
  );
}

function Hornet() {
  return (
    <>
      <path d="M22 101C24 89 34 80 50 79C66 80 76 89 78 101Z" fill="#B3283A" />
      <path d="M50 79C62 80 72 87 76 98L64 101C62 92 57 85 50 82Z" fill="#8E1C2C" />
      <path d="M33 87L38 76L44 82L50 75L56 82L62 76L67 87C61 84 55 83 50 83C45 83 39 84 33 87Z" fill="#C93A4C" />
      <path
        d="M50 82C60 82 67 74 67 64C67 57 67.5 51 70 45C74 37 78.5 27 78 12C74 22 68.5 30 64 37.5C60 44 56 48 50 48C44 48 40 44 36 37.5C31.5 30 26 22 22 12C21.5 27 26 37 30 45C32.5 51 33 57 33 64C33 74 40 82 50 82Z"
        fill={SHELL}
      />
      <path d="M64 52C66 64 63 76 53 81.5C62 81 67 73 67 64C67 59 66.8 55 67.2 50.5Z" fill={SHELL_SHADE} />
      <ellipse cx="42.5" cy="64" rx="4.8" ry="6.8" transform="rotate(-18 42.5 64)" fill={VOID} />
      <ellipse cx="57.5" cy="64" rx="4.8" ry="6.8" transform="rotate(18 57.5 64)" fill={VOID} />
    </>
  );
}
