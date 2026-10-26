import { useMemo } from 'react';
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Plus } from 'lucide-react';
import { occurrencesBetween, WEEK_STARTS_ON } from '../../lib/occurrences';
import { Note, type ViewProps } from './Note';

const MAX_MARKS = 3;

export function MonthView({ events, cursor, onSelect, onOpen, onCreate, onOpenDay }: ViewProps & { onOpenDay: (d: Date) => void }) {
  const monthStart = startOfMonth(cursor).getTime();
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(new Date(monthStart), { weekStartsOn: WEEK_STARTS_ON }),
        end: endOfWeek(endOfMonth(new Date(monthStart)), { weekStartsOn: WEEK_STARTS_ON }),
      }),
    [monthStart],
  );
  const occurrences = useMemo(
    () => occurrencesBetween(events, days[0], addDays(days[days.length - 1], 1)),
    [events, days],
  );
  const on = (d: Date) => occurrences.filter((o) => o.start < addDays(d, 1) && o.end > d);
  const selected = on(startOfDay(cursor));

  return (
    <div className="month">
      <div className="paper month-grid">
        {days.slice(0, 7).map((d) => (
          <span key={d.getDay()} className="weekday" aria-hidden="true">
            {format(d, 'EEEEE')}
          </span>
        ))}
        {days.map((d) => {
          const items = on(d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              className="day-cell"
              data-outside={!isSameMonth(d, cursor) || undefined}
              data-today={isToday(d) || undefined}
              aria-pressed={isSameDay(d, cursor)}
              aria-label={`${format(d, 'EEEE d MMMM')}${items.length ? `, ${items.length} events` : ''}`}
              onClick={() => onSelect(d)}
              onDoubleClick={() => onOpenDay(d)}
            >
              <span className="day-num">{format(d, 'd')}</span>
              <span className="marks">
                {items.slice(0, MAX_MARKS).map((o) => (
                  <span key={o.event.id + o.start.getTime()} className={`mark owner-${o.event.owner}`}>
                    {o.event.title}
                  </span>
                ))}
                {items.length > MAX_MARKS && <span className="more">+{items.length - MAX_MARKS}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="paper agenda" aria-label={format(cursor, 'EEEE d MMMM')}>
        <h2>{format(cursor, 'EEEE d')}</h2>
        {selected.length ? (
          selected.map((o) => <Note key={o.event.id + o.start.getTime()} o={o} onOpen={onOpen} detail />)
        ) : (
          <button type="button" className="empty" onClick={() => onCreate(cursor)} aria-label="Add to this day">
            <Plus size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
