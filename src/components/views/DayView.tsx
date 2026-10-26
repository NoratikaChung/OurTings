import { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, format, isToday, startOfDay } from 'date-fns';
import { isAllDay, layoutLanes, occurrencesBetween } from '../../lib/occurrences';
import { Note, type ViewProps } from './Note';

const HOUR = 52; // px per hour
const HOURS = Array.from({ length: 24 }, (_, h) => h);

const minutesInto = (day: Date, t: Date) => Math.min(24 * 60, Math.max(0, (t.getTime() - day.getTime()) / 60000));

export function DayView({ events, cursor, onOpen, onCreate }: ViewProps) {
  const dayKey = startOfDay(cursor).getTime();
  const day = useMemo(() => new Date(dayKey), [dayKey]);
  const occurrences = useMemo(() => occurrencesBetween(events, day, addDays(day, 1)), [events, day]);
  const allDay = occurrences.filter(isAllDay);
  const timed = layoutLanes(occurrences.filter((o) => !isAllDay(o)));
  const scroller = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const hour = isToday(day) ? new Date().getHours() - 1 : 7;
    scroller.current?.scrollTo({ top: Math.max(0, hour) * HOUR });
  }, [day]);

  return (
    <div className="day">
      {allDay.length > 0 && (
        <div className="paper all-day">
          {allDay.map((o) => (
            <Note key={o.event.id + o.start.getTime()} o={o} onOpen={onOpen} detail />
          ))}
        </div>
      )}
      <div className="paper timeline-scroll" ref={scroller}>
        <div
          className="timeline"
          style={{ height: 24 * HOUR }}
          onClick={(e) => {
            const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
            const start = new Date(day);
            start.setHours(Math.floor(y / HOUR), 0, 0, 0);
            onCreate(start);
          }}
        >
          {HOURS.map((h) => (
            <div key={h} className="hour" style={{ top: h * HOUR }}>
              <span>{format(new Date(2000, 0, 1, h), 'h a')}</span>
            </div>
          ))}
          {timed.map(({ item: o, lane, lanes }) => {
            const top = (minutesInto(day, o.start) / 60) * HOUR;
            const height = Math.max(26, (minutesInto(day, o.end) / 60) * HOUR - top);
            return (
              <div
                key={o.event.id + o.start.getTime()}
                className="slot"
                style={{ top, height, left: `calc(var(--gutter) + (100% - var(--gutter)) * ${lane / lanes})`, width: `calc((100% - var(--gutter)) / ${lanes} - 4px)` }}
              >
                <Note o={o} onOpen={onOpen} detail />
              </div>
            );
          })}
          {isToday(day) && <div className="now" style={{ top: (minutesInto(day, now) / 60) * HOUR }} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
