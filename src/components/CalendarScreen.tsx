import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfWeek,
  format,
  isSameMonth,
  isSameYear,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CloudOff, LogOut, Plus } from 'lucide-react';
import { Avatar } from '../art/Avatar';
import { subscribeEvents } from '../data/events';
import { WEEK_STARTS_ON } from '../lib/occurrences';
import { useUserPrefs } from '../lib/prefs';
import { USERS, USER_NAMES, type CalendarEvent, type Occurrence, type Theme, type UserId, type ViewMode } from '../types';
import { ThemeToggle } from './ui';
import { MonthView } from './views/MonthView';
import { WeekView } from './views/WeekView';
import { DayView } from './views/DayView';
import { YearView } from './views/YearView';
import { EventEditor, type EditorTarget } from './EventEditor';
import { EventDetail } from './EventDetail';

const VIEWS: { mode: ViewMode; label: string }[] = [
  { mode: 'day', label: 'D' },
  { mode: 'week', label: 'W' },
  { mode: 'month', label: 'M' },
  { mode: 'year', label: 'Y' },
];
const VIEW_NAMES: Record<ViewMode, string> = { day: 'Day', week: 'Week', month: 'Month', year: 'Year' };

const STEP: Record<ViewMode, (d: Date, n: number) => Date> = {
  day: addDays,
  week: addWeeks,
  month: addMonths,
  year: addYears,
};

function title(view: ViewMode, d: Date) {
  if (view === 'day') return format(d, 'EEE d MMM yyyy');
  if (view === 'month') return format(d, 'MMMM yyyy');
  if (view === 'year') return format(d, 'yyyy');
  const s = startOfWeek(d, { weekStartsOn: WEEK_STARTS_ON });
  const e = endOfWeek(d, { weekStartsOn: WEEK_STARTS_ON });
  if (isSameMonth(s, e)) return `${format(s, 'd')} – ${format(e, 'd MMM yyyy')}`;
  return isSameYear(s, e) ? `${format(s, 'd MMM')} – ${format(e, 'd MMM yyyy')}` : `${format(s, 'd MMM yy')} – ${format(e, 'd MMM yy')}`;
}

export function CalendarScreen({
  user,
  theme,
  onToggleTheme,
  onLogout,
}: {
  user: UserId;
  theme: Theme;
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  const [prefs, setPrefs] = useUserPrefs(user);
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditorTarget | null>(null);
  const [viewing, setViewing] = useState<Occurrence | null>(null);
  const [menu, setMenu] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => subscribeEvents((e) => (setEvents(e), setError(null)), (e) => setError(e.message)), []);

  const visible = useMemo(() => events.filter((e) => prefs.visible[e.owner]), [events, prefs.visible]);
  // Keep the open detail in sync with live edits/deletes from the other device.
  const liveViewing = viewing && events.find((e) => e.id === viewing.event.id);

  const view = prefs.view;
  const setView = (v: ViewMode) => setPrefs({ ...prefs, view: v });
  const go = (n: number) => setCursor(STEP[view](cursor, n));
  const openDay = (d: Date) => (setCursor(d), setView('day'));

  const viewProps = {
    events: visible,
    cursor,
    onSelect: setCursor,
    onOpen: setViewing,
    onCreate: (start: Date) => setEditing({ start, timed: false }),
  };

  return (
    <main className="calendar">
      <header className="paper topbar">
        <div className="me">
          <button type="button" className="avatar-btn" onClick={() => setMenu(!menu)} aria-label={USER_NAMES[user]} aria-expanded={menu}>
            <Avatar user={user} theme={theme} size={40} />
          </button>
          {menu && (
            <div className="paper menu">
              <button type="button" onClick={onLogout}>
                <LogOut size={18} /> Log out
              </button>
            </div>
          )}
        </div>
        <div className="nav">
          <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous">
            <ChevronLeft size={22} />
          </button>
          <button type="button" className="title" onClick={() => setCursor(new Date())} title="Today">
            {title(view, cursor)}
          </button>
          <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next">
            <ChevronRight size={22} />
          </button>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <div className="toolbar">
        <div className="paper segmented" role="tablist" aria-label="View">
          {VIEWS.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={view === mode}
              aria-label={VIEW_NAMES[mode]}
              title={VIEW_NAMES[mode]}
              onClick={() => setView(mode)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="paper filters">
          {USERS.map((u) => (
            <button
              key={u}
              type="button"
              className={`filter owner-${u}`}
              aria-pressed={prefs.visible[u]}
              aria-label={`${USER_NAMES[u]}'s calendar`}
              title={`${USER_NAMES[u]}'s calendar`}
              onClick={() => setPrefs({ ...prefs, visible: { ...prefs.visible, [u]: !prefs.visible[u] } })}
            >
              <Avatar user={u} theme={theme} size={30} />
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="paper banner" role="alert">
          <CloudOff size={18} /> {error}
        </p>
      )}

      <section
        className={`view view-${view}`}
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s || e.pointerType === 'mouse') return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 60 && Math.abs(e.clientY - s.y) < 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {view === 'month' && <MonthView {...viewProps} onOpenDay={openDay} />}
        {view === 'week' && <WeekView {...viewProps} onOpenDay={openDay} />}
        {view === 'day' && <DayView {...viewProps} onCreate={(start) => setEditing({ start, timed: true })} />}
        {view === 'year' && <YearView {...viewProps} onOpenMonth={(d) => (setCursor(d), setView('month'))} />}
      </section>

      <button type="button" className="fab" onClick={() => setEditing({ start: cursor, timed: false })} aria-label="New event">
        <Plus size={28} />
      </button>

      {editing && (
        <EventEditor
          target={editing}
          user={user}
          onClose={() => setEditing(null)}
          onSaved={(start) => setCursor(start)}
          onError={setError}
        />
      )}
      {viewing && liveViewing && !editing && (
        <EventDetail
          occurrence={{ ...viewing, event: liveViewing }}
          user={user}
          theme={theme}
          onClose={() => setViewing(null)}
          onEdit={() => setEditing({ event: liveViewing })}
        />
      )}
    </main>
  );
}
