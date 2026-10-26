import { useId, type ReactNode } from 'react';
import { USER_NAMES, type Theme, type UserId } from '../types';

interface AvatarProps {
  user: UserId;
  theme: Theme;
  size?: number;
}

/** Round character portrait: Totoro and Chibi Totoro in light, little bug knights in dark. */
export function Avatar({ user, theme, size = 96 }: AvatarProps) {
  // useId output may contain characters that are awkward inside url(#…) references.
  const uid = `av${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const art: ReactNode =
    theme === 'light' ? (
      user === 'nora' ? <Chibi /> : <Totoro uid={uid} />
    ) : (
      <Cavern uid={uid}>{user === 'nora' ? <Hornet /> : <Knight />}</Cavern>
    );
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={USER_NAMES[user]}>
      {art}
    </svg>
  );
}

/* ---------- light: big grey Totoro (Anant) ---------- */

const TOTORO_INK = '#3A3230';
const TOTORO_FUR = '#8E8F94';
const CHEVRON = 'M-4.5 2Q0-4 4.5 2Q0-0.5-4.5 2Z';

function Totoro({ uid }: { uid: string }) {
  const clip = `${uid}-disc`;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="45.5" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill="#F2A541" />
      <g clipPath={`url(#${clip})`} stroke={TOTORO_INK} strokeLinejoin="round" strokeLinecap="round">
        <g fill={TOTORO_FUR} strokeWidth="2.6">
          <path d="M30 44C26 34 26 22 30 12C35 20 39 31 40 41Z" />
          <path d="M70 44C74 34 74 22 70 12C65 20 61 31 60 41Z" />
          <path d="M50 34C66 34 76 42 79 56C82 70 86 86 88 104H12C14 86 18 70 21 56C24 42 34 34 50 34Z" />
        </g>
        <ellipse cx="50" cy="98" rx="27" ry="24" fill="#F3ECD9" stroke="none" />
        <g fill="#77787D" stroke="none">
          <path d={CHEVRON} transform="translate(40 84)" />
          <path d={CHEVRON} transform="translate(50 81)" />
          <path d={CHEVRON} transform="translate(60 84)" />
        </g>
        <g fill="none" strokeWidth="1.8">
          <path d="M24 55L9 51M24 60L8 60M25 65L10 69M76 55L91 51M76 60L92 60M75 65L90 69" />
        </g>
        <g fill="#FFFDF5" strokeWidth="2">
          <circle cx="36" cy="52" r="6" />
          <circle cx="64" cy="52" r="6" />
        </g>
        <circle cx="37" cy="52" r="2.4" fill={TOTORO_INK} stroke="none" />
        <circle cx="63" cy="52" r="2.4" fill={TOTORO_INK} stroke="none" />
        <path d="M46.5 47.5Q50 46 53.5 47.5Q50 51 46.5 47.5Z" fill={TOTORO_INK} strokeWidth="1" />
        <path d="M29 59C38 66 62 66 71 59C68 71 32 71 29 59Z" fill="#FFFDF5" strokeWidth="2.2" />
        <path d="M40 63.4V67.2M50 64.3V68M60 63.4V67.2" fill="none" strokeWidth="1.5" />
      </g>
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="#6B4A2E" strokeWidth="3.2" />
    </>
  );
}

/* ---------- light: little white Chibi Totoro with a sprout (Nora) ---------- */

const CHIBI_INK = '#4A3F38';

function Chibi() {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill="#B9CDA4" />
      <path d="M18 92C30 86 70 86 82 92C70 97 30 97 18 92Z" fill="#A6BE8F" />
      <path
        fill="#9AB585"
        d="M14 84L16.5 75L19 84L21.5 77.5L24 85ZM77 85L79.5 76L82 84.5L84.5 78L86.5 86ZM60 90L62 83L64 90L66 85L68 91Z"
      />
      <g transform="translate(3 0)" stroke={CHIBI_INK} strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="40" cy="84" rx="7" ry="3.6" fill="#FFFFFF" strokeWidth="2.2" />
        <path
          d="M55 84C69 84 76 75 75 63C74.5 55 72 48 69.5 43L71 29L62.5 36.5C59 35.5 54 35.5 49.5 36.5L41 29L41.5 43C37 49 35 56 35 64C35 76 43 84 55 84Z"
          fill="#FFFFFF"
          strokeWidth="2.8"
        />
        <ellipse cx="56" cy="78.5" rx="12.5" ry="4" fill="#F4E4DF" stroke="none" />
        <path d="M37 66C33 56 31 40 33.5 22" fill="none" strokeWidth="2.2" />
        <g fill="#7CC242" strokeWidth="2">
          <path d="M33.5 22C30 16 23 15 20 18C23 22 29 23 33.5 22Z" />
          <path d="M33.5 22C36 15 43 13 47 15.5C44 20 38 22 33.5 22Z" />
        </g>
        <ellipse cx="38" cy="63" rx="3.6" ry="4.6" fill="#FFFFFF" strokeWidth="2.2" />
        <circle cx="49" cy="55" r="2.7" fill={CHIBI_INK} stroke="none" />
        <circle cx="63" cy="55" r="2.7" fill={CHIBI_INK} stroke="none" />
        <circle cx="49.9" cy="54.1" r="0.8" fill="#FFFFFF" stroke="none" />
        <circle cx="63.9" cy="54.1" r="0.8" fill="#FFFFFF" stroke="none" />
        <path d="M53.5 61Q56 63.2 58.5 61" fill="none" strokeWidth="1.8" />
      </g>
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
