import { TZDate } from '@date-fns/tz';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
} from 'date-fns';
import type { CalendarEvent, LocalDateTime, Occurrence, Repeat } from '../types';

export const WEEK_STARTS_ON = 1 as const; // Monday

/**
 * A wall-clock time as a Date for calendar maths. With a zone it is a TZDate, so stepping by days or months keeps
 * the time of day in that zone (across its daylight-saving changes); without one it is this device's local time.
 */
function anchor(value: LocalDateTime, timeZone: string): Date {
  const [date, time = '00:00'] = value.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return timeZone ? new TZDate(y, m - 1, d, h, min, timeZone) : new Date(y, m - 1, d, h, min);
}

/** The instant of a wall-clock time, as a plain Date so it formats in this device's zone. */
export function parseLocal(value: LocalDateTime, timeZone = ''): Date {
  return new Date(anchor(value, timeZone).getTime());
}

export function toLocal(date: Date): LocalDateTime {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

/** How a repeat steps, and roughly how many steps separate two dates (callers back off by one). */
const REPEATS: Record<Exclude<Repeat, 'none'>, { step: (date: Date, n: number) => Date; between: (later: Date, earlier: Date) => number }> = {
  daily: { step: addDays, between: differenceInCalendarDays },
  weekly: { step: addWeeks, between: (later, earlier) => Math.floor(differenceInCalendarDays(later, earlier) / 7) },
  // Stepping from the first date each time clamps the 31st to shorter months' last day without drifting
  // (31 Jan → 28 Feb → 31 Mar), and a 29 Feb birthday to 28 Feb in non-leap years.
  monthly: { step: addMonths, between: differenceInCalendarMonths },
  yearly: { step: addYears, between: differenceInCalendarYears },
};

/** All occurrences overlapping [from, to), sorted all-day first then by start. */
export function occurrencesBetween(events: CalendarEvent[], from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = [];
  for (const event of events) {
    const birthday = event.kind === 'birthday';
    const dated = event.allDay || birthday;
    // All-day events cover whole days through their end date; a birthday is its one day.
    const first = dated ? anchor(event.start.slice(0, 10), '') : anchor(event.start, event.timeZone);
    const last = dated
      ? addDays(anchor((birthday ? event.start : event.end).slice(0, 10), ''), 1)
      : anchor(event.end, event.timeZone);
    const days = differenceInCalendarDays(last, first);
    const duration = last.getTime() - first.getTime();
    const push = (start: Date) => {
      // Dated repeats keep whole days (a 23- or 25-hour day around a clock change is still one day).
      const end = dated ? addDays(start, days) : new Date(start.getTime() + duration);
      if (start < to && end > from) out.push({ event, start: new Date(start.getTime()), end: new Date(end.getTime()) });
    };

    const repeat = birthday ? 'yearly' : event.repeat;
    if (repeat === 'none') {
      push(first);
      continue;
    }
    const until = birthday ? '' : event.repeatUntil;
    const { step, between } = REPEATS[repeat];
    // Jump straight to the repeats near the range; earlier ones would end before it.
    for (let n = Math.max(0, between(new Date(from.getTime() - duration), first) - 1); ; n++) {
      const start = step(first, n);
      if (start >= to || (until && format(start, 'yyyy-MM-dd') > until)) break;
      push(start);
    }
  }
  return out.sort(
    (a, b) =>
      Number(b.event.allDay || b.event.kind === 'birthday') - Number(a.event.allDay || a.event.kind === 'birthday') ||
      a.start.getTime() - b.start.getTime() ||
      a.event.title.localeCompare(b.event.title),
  );
}

export function isAllDay(o: Occurrence) {
  return o.event.allDay || o.event.kind === 'birthday';
}

/** Side-by-side lanes for overlapping timed occurrences in a day column. */
export function layoutLanes(items: Occurrence[]): { item: Occurrence; lane: number; lanes: number }[] {
  const sorted = [...items].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
  const result: { item: Occurrence; lane: number; lanes: number }[] = [];
  let cluster: { item: Occurrence; lane: number; lanes: number }[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    for (const r of cluster) r.lanes = laneEnds.length;
    result.push(...cluster);
    cluster = [];
    laneEnds = [];
  };
  for (const item of sorted) {
    if (item.start.getTime() >= clusterEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= item.start.getTime());
    if (lane === -1) lane = laneEnds.push(0) - 1;
    laneEnds[lane] = item.end.getTime();
    clusterEnd = Math.max(clusterEnd, item.end.getTime());
    cluster.push({ item, lane, lanes: 0 });
  }
  flush();
  return result;
}
