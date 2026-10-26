import { addDays, format, isLeapYear } from 'date-fns';
import type { CalendarEvent, LocalDateTime, Occurrence } from '../types';

export const WEEK_STARTS_ON = 1 as const; // Monday

export function parseLocal(value: LocalDateTime): Date {
  const [date, time = '00:00'] = value.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

export function toLocal(date: Date): LocalDateTime {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function dayStart(value: LocalDateTime): Date {
  const d = parseLocal(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Concrete [start, end) span; all-day events cover whole days through their end date. */
function span(event: CalendarEvent, start: LocalDateTime, end: LocalDateTime) {
  return event.allDay
    ? { start: dayStart(start), end: addDays(dayStart(end), 1) }
    : { start: parseLocal(start), end: parseLocal(end) };
}

/** Birthday date in a given year; 29 Feb falls on 28 Feb in non-leap years. */
function birthdayIn(year: number, original: Date): Date {
  const month = original.getMonth();
  const day = month === 1 && original.getDate() === 29 && !isLeapYear(new Date(year, 0, 1)) ? 28 : original.getDate();
  return new Date(year, month, day);
}

/** All occurrences overlapping [from, to), sorted all-day first then by start. */
export function occurrencesBetween(events: CalendarEvent[], from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = [];
  for (const event of events) {
    if (event.kind === 'birthday') {
      const born = dayStart(event.start);
      for (let year = Math.max(from.getFullYear(), born.getFullYear()); year <= to.getFullYear(); year++) {
        const start = birthdayIn(year, born);
        const end = addDays(start, 1);
        if (start < to && end > from) out.push({ event, start, end });
      }
      continue;
    }
    const s = span(event, event.start, event.end);
    if (s.start < to && s.end > from) out.push({ event, ...s });
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
