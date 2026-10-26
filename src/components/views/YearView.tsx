import { useMemo } from 'react';
import {
  addDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { occurrencesBetween, WEEK_STARTS_ON } from '../../lib/occurrences';
import type { UserId } from '../../types';
import type { ViewProps } from './Note';

export function YearView({ events, cursor, onOpenMonth }: ViewProps & { onOpenMonth: (d: Date) => void }) {
  const year = cursor.getFullYear();
  const months = useMemo(() => eachMonthOfInterval({ start: new Date(year, 0, 1), end: new Date(year, 11, 1) }), [year]);

  /** yyyy-MM-dd → owners with something on that day. */
  const busy = useMemo(() => {
    const from = startOfYear(new Date(year, 0, 1));
    const to = addDays(endOfYear(from), 1);
    const map = new Map<string, Set<UserId>>();
    for (const o of occurrencesBetween(events, from, to)) {
      const last = new Date(Math.min(o.end.getTime() - 1, to.getTime() - 1));
      for (let d = new Date(Math.max(o.start.getTime(), from.getTime())); d <= last; d = addDays(d, 1)) {
        const key = format(d, 'yyyy-MM-dd');
        map.set(key, (map.get(key) ?? new Set()).add(o.event.owner));
      }
    }
    return map;
  }, [events, year]);

  return (
    <div className="year">
      {months.map((m) => (
        <button key={m.getMonth()} type="button" className="paper mini" onClick={() => onOpenMonth(m)} aria-label={format(m, 'MMMM yyyy')}>
          <h3>{format(m, 'MMM')}</h3>
          <span className="mini-grid">
            {eachDayOfInterval({
              start: startOfWeek(startOfMonth(m), { weekStartsOn: WEEK_STARTS_ON }),
              end: endOfWeek(endOfMonth(m), { weekStartsOn: WEEK_STARTS_ON }),
            }).map((d) => {
              const owners = isSameMonth(d, m) ? busy.get(format(d, 'yyyy-MM-dd')) : undefined;
              return (
                <span
                  key={d.getTime()}
                  className="mini-day"
                  data-outside={!isSameMonth(d, m) || undefined}
                  data-today={(isSameMonth(d, m) && isToday(d)) || undefined}
                  data-busy={owners ? [...owners].sort().join(' ') : undefined}
                >
                  {isSameMonth(d, m) ? format(d, 'd') : ''}
                </span>
              );
            })}
          </span>
        </button>
      ))}
    </div>
  );
}
