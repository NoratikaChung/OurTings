export type UserId = 'nora' | 'anant';
export type Theme = 'light' | 'dark';
export type ViewMode = 'day' | 'week' | 'month' | 'year';

export const USERS: readonly UserId[] = ['nora', 'anant'];
export const USER_NAMES: Record<UserId, string> = { nora: 'Nora', anant: 'Anant' };

/** Local wall-clock time, `yyyy-MM-dd'T'HH:mm`. Both users share one timezone, so times are stored floating. */
export type LocalDateTime = string;

export type EventKind = 'event' | 'birthday';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  place: string;
  start: LocalDateTime;
  end: LocalDateTime;
  allDay: boolean;
  kind: EventKind;
  /** Birthdays repeat every year; regular events do not repeat. */
  owner: UserId;
}

export type EventInput = Omit<CalendarEvent, 'id'>;

/** One visible instance of an event on a given range (birthdays expand into one per year). */
export interface Occurrence {
  event: CalendarEvent;
  start: Date;
  end: Date;
}

export interface EventComment {
  id: string;
  text: string;
  author: UserId;
  createdAt: Date | null;
}
