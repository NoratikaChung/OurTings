import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { addDays, addMinutes, format, isToday } from 'date-fns';
import { formatTime } from '../../lib/format';
import { isAllDay, layoutLanes, occurrencesBetween } from '../../lib/occurrences';
import { Note, type ViewProps } from './Note';

const HOUR = 56; // px per hour
const HOURS = Array.from({ length: 23 }, (_, i) => i + 1); // labels and lines sit on the boundaries between hours
const OPEN_AT_HOUR = 6; // the timetable opens scrolled to 6 am; earlier and later hours are a scroll away
/** Hour labels in the device's own locale and hour cycle. */
const HOUR_LABEL = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });

const SLOT = 30; // minutes; picked time snaps to half hours, like Outlook
const SLOT_PX = (HOUR * SLOT) / 60;
const LAST_SLOT = (24 * 60) / SLOT - 1;
const LONG_PRESS = 400; // ms a finger rests on an empty slot before dragging picks time instead of scrolling

const minutesInto = (day: Date, t: Date) => Math.min(24 * 60, Math.max(0, (t.getTime() - day.getTime()) / 60000));

/** Time picked in one column, highlighted: [from, to) in minutes after midnight. */
interface Pick {
  day: number;
  from: number;
  to: number;
}

/** A press on an empty part of a column, which may become a time pick. */
interface Press {
  pointerId: number;
  day: Date;
  anchor: number; // half-hour slot the pick grows from
  slot: number; // slot under the pointer now
  touch: boolean;
  picking: boolean; // a finger on an empty slot isn't picking until the long press; moving before that scrolls
  dragged: boolean;
  x: number;
  y: number;
  timer?: number;
}

/**
 * Timetable for the week and day views: days side by side, hours running down, each timed event a card as tall as
 * it lasts. Overlapping events share their day's width; all-day events and birthdays sit in a strip under the dates.
 *
 * Adding events, as in Outlook. Mouse: a click selects a half hour, a double click creates a one-hour event there,
 * and dragging picks a block of half hours, creating an event for it on release. Touch (a plain drag must scroll): a
 * tap selects a half hour; tapping the selection creates an event there (so a double tap works at any speed);
 * dragging from the selection stretches it at once; and a long press anywhere, then drag, picks too. Released
 * picks of a single half hour become the usual one-hour event.
 */
export function Timetable({
  days,
  events,
  comments,
  theme,
  onOpen,
  onCreate,
  onOpenDay,
}: ViewProps & { days: Date[]; onOpenDay?: (d: Date) => void }) {
  const fromKey = days[0].getTime();
  const toKey = addDays(days[days.length - 1], 1).getTime();
  const occurrences = useMemo(() => occurrencesBetween(events, new Date(fromKey), new Date(toKey)), [events, fromKey, toKey]);
  const scroller = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());
  const [pick, setPick] = useState<Pick | null>(null);
  const press = useRef<Press | null>(null);
  const touched = useRef(false); // the last press was a finger (touch browsers also send dblclick)

  // Once a finger is picking time, stop it scrolling the timetable (only a non-passive listener can).
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const hold = (e: TouchEvent) => {
      if (press.current?.picking) e.preventDefault();
    };
    el.addEventListener('touchmove', hold, { passive: false });
    return () => el.removeEventListener('touchmove', hold);
  }, []);

  const slotAt = (e: MouseEvent<HTMLElement>) =>
    Math.min(LAST_SLOT, Math.max(0, Math.floor((e.clientY - e.currentTarget.getBoundingClientRect().top) / SLOT_PX)));
  const show = (p: Press) =>
    setPick({ day: p.day.getTime(), from: Math.min(p.anchor, p.slot) * SLOT, to: (Math.max(p.anchor, p.slot) + 1) * SLOT });
  const create = (day: Date, from: number, to: number) => {
    setPick(null);
    onCreate(addMinutes(day, from), addMinutes(day, to));
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // A little above the 6 am line, so its label isn't half under the sticky dates.
    scroller.current?.scrollTo({ top: OPEN_AT_HOUR * HOUR - 12 });
  }, [fromKey]);

  const columns = days.map((day) => {
    const next = addDays(day, 1);
    const items = occurrences.filter((o) => o.start < next && o.end > day);
    return { day, allDay: items.filter(isAllDay), timed: layoutLanes(items.filter((o) => !isAllDay(o))) };
  });

  return (
    <div className="paper timetable" ref={scroller} style={{ '--days': days.length } as CSSProperties}>
      <div className="tt-sticky">
        <div className="tt-row">
          <span />
          {days.map((d) => (
            <button
              key={d.getTime()}
              type="button"
              className="tt-day"
              data-today={isToday(d) || undefined}
              disabled={!onOpenDay}
              onClick={() => onOpenDay?.(d)}
              aria-label={format(d, 'EEEE d MMMM')}
            >
              <span>{format(d, 'EEE')}</span>
              <strong>{format(d, 'd')}</strong>
            </button>
          ))}
        </div>
        {columns.some((c) => c.allDay.length > 0) && (
          <div className="tt-row tt-allday">
            <span className="tt-label">All day</span>
            {columns.map(({ day, allDay }) => (
              <div key={day.getTime()} className="tt-allday-cell">
                {allDay.map((o) => (
                  <Note key={o.event.id + o.start.getTime()} o={o} theme={theme} onOpen={onOpen} compact />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tt-row tt-body" style={{ height: 24 * HOUR }}>
        <div className="tt-hours" aria-hidden="true">
          {HOURS.map((h) => (
            <span key={h} style={{ top: h * HOUR }}>
              {HOUR_LABEL.format(new Date(2000, 0, 1, h))}
            </span>
          ))}
        </div>
        {/* Real 1px lines, one per hour: a repeating gradient drops some of them at phone pixel ratios. */}
        {HOURS.map((h) => (
          <div key={h} className="tt-line" style={{ top: h * HOUR }} aria-hidden="true" />
        ))}
        {columns.map(({ day, timed }) => (
          <div
            key={day.getTime()}
            className="tt-col"
            data-today={isToday(day) || undefined}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              const slot = slotAt(e);
              const p: Press = {
                pointerId: e.pointerId,
                day,
                anchor: slot,
                slot,
                touch: e.pointerType !== 'mouse',
                picking: false,
                dragged: false,
                x: e.clientX,
                y: e.clientY,
              };
              touched.current = p.touch;
              if (p.touch && pick?.day === day.getTime() && slot * SLOT >= pick.from && slot * SLOT < pick.to) {
                // On the selection: picking starts at once (tap → create, drag → stretch).
                p.picking = true;
                p.anchor = pick.from / SLOT;
                p.slot = pick.to / SLOT - 1;
              } else if (p.touch) {
                p.timer = window.setTimeout(() => {
                  p.picking = true;
                  navigator.vibrate?.(10); // a small buzz where supported (Android)
                  show(p);
                }, LONG_PRESS);
              } else {
                p.picking = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                show(p);
              }
              press.current = p;
            }}
            onPointerMove={(e) => {
              const p = press.current;
              if (!p || p.pointerId !== e.pointerId) return;
              if (!p.picking) {
                if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) {
                  clearTimeout(p.timer); // moved before the long press: it's a scroll
                  press.current = null;
                }
                return;
              }
              const slot = slotAt(e);
              if (slot === p.slot) return;
              p.slot = slot;
              p.dragged = true;
              show(p);
            }}
            onPointerUp={(e) => {
              const p = press.current;
              press.current = null;
              if (!p || p.pointerId !== e.pointerId) return;
              clearTimeout(p.timer);
              if (p.dragged || (p.touch && p.picking)) {
                e.stopPropagation(); // a pick, not a swipe to the next week
                const from = Math.min(p.anchor, p.slot) * SLOT;
                const to = (Math.max(p.anchor, p.slot) + 1) * SLOT;
                create(day, from, to - from > SLOT ? to : from + 60);
                return;
              }
              // A click has selected its half hour (a double click, below, creates); a tap selects its half hour.
              if (p.touch) show(p);
            }}
            onPointerCancel={() => {
              clearTimeout(press.current?.timer);
              press.current = null;
            }}
            onDoubleClick={(e) => {
              if (touched.current) return; // double taps are handled above
              const from = slotAt(e) * SLOT;
              create(day, from, from + 60);
            }}
          >
            {timed.map(({ item: o, lane, lanes }) => {
              const top = (minutesInto(day, o.start) / 60) * HOUR;
              const height = Math.max(30, (minutesInto(day, o.end) / 60) * HOUR - top);
              return (
                <div
                  key={o.event.id + o.start.getTime()}
                  className="tt-event"
                  style={{ top, height, left: `${(lane / lanes) * 100}%`, width: `${100 / lanes}%` }}
                >
                  <Note o={o} comments={comments.get(o.event.id)} theme={theme} onOpen={onOpen} />
                </div>
              );
            })}
            {isToday(day) && <div className="now" style={{ top: (minutesInto(day, now) / 60) * HOUR }} aria-hidden="true" />}
            {pick?.day === day.getTime() && (
              <div className="tt-pick" style={{ top: (pick.from / 60) * HOUR, height: ((pick.to - pick.from) / 60) * HOUR }} aria-hidden="true">
                {formatTime(addMinutes(day, pick.from))} – {formatTime(addMinutes(day, pick.to))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
