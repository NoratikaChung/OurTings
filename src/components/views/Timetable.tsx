import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { addDays, format, isToday } from 'date-fns';
import { isAllDay, layoutLanes, occurrencesBetween } from '../../lib/occurrences';
import { Note, type ViewProps } from './Note';

const HOUR = 56; // px per hour
const HOURS = Array.from({ length: 23 }, (_, i) => i + 1); // labels and lines sit on the boundaries between hours
const OPEN_AT_HOUR = 6; // the timetable opens scrolled to 6 am; earlier and later hours are a scroll away
/** Hour labels in the device's own locale and hour cycle. */
const HOUR_LABEL = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });

const minutesInto = (day: Date, t: Date) => Math.min(24 * 60, Math.max(0, (t.getTime() - day.getTime()) / 60000));

/**
 * Timetable for the week and day views: days side by side, hours running down, each timed event a card as tall as
 * it lasts. Overlapping events share their day's width; all-day events and birthdays sit in a strip under the dates.
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
            onClick={(e) => {
              const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
              const start = new Date(day);
              start.setHours(Math.floor(y / HOUR), 0, 0, 0);
              onCreate(start);
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
          </div>
        ))}
      </div>
    </div>
  );
}
