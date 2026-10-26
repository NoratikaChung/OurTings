import { describe, expect, it } from 'vitest';
import { layoutLanes, occurrencesBetween } from '../../src/lib/occurrences';
import type { CalendarEvent } from '../../src/types';

const ev = (patch: Partial<CalendarEvent>): CalendarEvent => ({
  id: patch.title ?? 'x',
  title: 'x',
  description: '',
  place: '',
  start: '2026-10-26T09:00',
  end: '2026-10-26T10:00',
  allDay: false,
  kind: 'event',
  owner: 'nora',
  ...patch,
});

describe('occurrencesBetween', () => {
  it('includes a multi-day all-day event on its last day but not the day after', () => {
    const trip = ev({ title: 'trip', allDay: true, start: '2026-10-24T00:00', end: '2026-10-26T00:00' });
    expect(occurrencesBetween([trip], new Date(2026, 9, 26), new Date(2026, 9, 27))).toHaveLength(1);
    expect(occurrencesBetween([trip], new Date(2026, 9, 27), new Date(2026, 9, 28))).toHaveLength(0);
  });

  it('excludes a timed event that ends exactly when the range starts', () => {
    const late = ev({ start: '2026-10-25T22:00', end: '2026-10-26T00:00' });
    expect(occurrencesBetween([late], new Date(2026, 9, 26), new Date(2026, 9, 27))).toHaveLength(0);
    expect(occurrencesBetween([late], new Date(2026, 9, 25), new Date(2026, 9, 26))).toHaveLength(1);
  });

  it('repeats birthdays yearly from the birth year, never before it', () => {
    const bday = ev({ title: 'bday', kind: 'birthday', allDay: true, start: '2024-03-15T00:00', end: '2024-03-15T00:00' });
    const occ = occurrencesBetween([bday], new Date(2023, 0, 1), new Date(2027, 0, 1));
    expect(occ.map((o) => o.start.getFullYear())).toEqual([2024, 2025, 2026]);
    expect(occ.every((o) => o.start.getMonth() === 2 && o.start.getDate() === 15)).toBe(true);
  });

  it('shows a 29 Feb birthday on 28 Feb in non-leap years', () => {
    const leap = ev({ kind: 'birthday', allDay: true, start: '2024-02-29T00:00', end: '2024-02-29T00:00' });
    const [o2025] = occurrencesBetween([leap], new Date(2025, 0, 1), new Date(2026, 0, 1));
    const [o2028] = occurrencesBetween([leap], new Date(2028, 0, 1), new Date(2029, 0, 1));
    expect(o2025.start).toEqual(new Date(2025, 1, 28));
    expect(o2028.start).toEqual(new Date(2028, 1, 29));
  });

  it('sorts all-day and birthdays before timed events, then by start time', () => {
    const items = [
      ev({ title: 'late', start: '2026-10-26T15:00', end: '2026-10-26T16:00' }),
      ev({ title: 'early', start: '2026-10-26T08:00', end: '2026-10-26T09:00' }),
      ev({ title: 'holiday', allDay: true, start: '2026-10-26T00:00', end: '2026-10-26T00:00' }),
    ];
    const titles = occurrencesBetween(items, new Date(2026, 9, 26), new Date(2026, 9, 27)).map((o) => o.event.title);
    expect(titles).toEqual(['holiday', 'early', 'late']);
  });
});

describe('layoutLanes', () => {
  it('puts overlapping events side by side and lets back-to-back events share a lane', () => {
    const day = (s: string, e: string, title: string) => ev({ title, start: `2026-10-26T${s}`, end: `2026-10-26T${e}` });
    const occ = occurrencesBetween(
      [day('09:00', '10:00', 'a'), day('09:30', '11:00', 'b'), day('10:00', '10:30', 'c'), day('12:00', '13:00', 'd')],
      new Date(2026, 9, 26),
      new Date(2026, 9, 27),
    );
    const lanes = Object.fromEntries(layoutLanes(occ).map((r) => [r.item.event.title, [r.lane, r.lanes]]));
    expect(lanes).toEqual({ a: [0, 2], b: [1, 2], c: [0, 2], d: [0, 1] });
  });
});
