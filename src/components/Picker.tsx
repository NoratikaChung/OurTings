import { Avatar } from '../art/Avatar';
import { ThemeToggle } from './ui';
import { USERS, USER_NAMES, type Theme, type UserId } from '../types';

export function Picker({
  theme,
  onToggleTheme,
  onPick,
}: {
  theme: Theme;
  onToggleTheme: () => void;
  onPick: (user: UserId) => void;
}) {
  return (
    <main className="center-screen">
      <div className="top-right">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="picker">
        {USERS.map((u) => (
          <button key={u} type="button" className={`pick owner-${u}`} onClick={() => onPick(u)}>
            <Avatar user={u} theme={theme} size={132} />
            <span>{USER_NAMES[u]}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
