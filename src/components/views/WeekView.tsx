import { useMemo } from 'react';
import { addDays, eachDayOfInterval, endOfWeek, format, isSameDay, isToday, startOfWeek } from 'date-fns';
import { occurrencesBetween, WEEK_STARTS_ON } from '../../lib/occurrences';
import { Note, type ViewProps } from './Note';

export function WeekView({ events, cursor, onSelect, onOpen, onOpenDay }: ViewProps & { onOpenDay: (d: Date) => void }) {
  const weekKey = startOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON }).getTime();
  const days = useMemo(
    () => eachDayOfInterval({ start: new Date(weekKey), end: endOfWeek(new Date(weekKey), { weekStartsOn: WEEK_STARTS_ON }) }),
    [weekKey],
  );
  const occurrences = useMemo(() => occurrencesBetween(events, days[0], addDays(days[6], 1)), [events, days]);

  return (
    <div className="week">
      {days.map((d) => {
        const items = occurrences.filter((o) => o.start < addDays(d, 1) && o.end > d);
        return (
          <div
            key={d.getTime()}
            className="paper week-day"
            data-today={isToday(d) || undefined}
            data-selected={isSameDay(d, cursor) || undefined}
            onClick={() => onSelect(d)}
          >
            <button type="button" className="week-day-head" onClick={() => onOpenDay(d)} aria-label={format(d, 'EEEE d MMMM')}>
              <span>{format(d, 'EEE')}</span>
              <strong>{format(d, 'd')}</strong>
            </button>
            <div className="week-day-notes">
              {items.map((o) => (
                <Note key={o.event.id + o.start.getTime()} o={o} onOpen={onOpen} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
