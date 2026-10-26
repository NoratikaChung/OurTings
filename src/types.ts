export type UserId = 'nora' | 'anant';
export type Theme = 'light' | 'dark';
export type ViewMode = 'day' | 'week' | 'month' | 'year';

export const USERS: readonly UserId[] = ['nora', 'anant'];
export const USER_NAMES: Record<UserId, string> = { nora: 'Nora', anant: 'Anant' };

/** Wall-clock time `yyyy-MM-dd'T'HH:mm`, read in the event's `timeZone` (all-day events and birthdays use only the date). */
export type LocalDateTime = string;

export type EventKind = 'event' | 'birthday';

export type Repeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export const REPEAT_NAMES: Record<Exclude<Repeat, 'none'>, string> = {
  daily: 'Every day',
  weekly: 'Every week',
  monthly: 'Every month',
  yearly: 'Every year',
};

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  place: string;
  start: LocalDateTime;
  end: LocalDateTime;
  /**
   * IANA zone the times were entered in; each device shows timed events converted to its own zone.
   * Empty for all-day events and birthdays (a date is the same date everywhere) and for events saved
   * before zones were recorded, which read as the device's own time.
   */
  timeZone: string;
  allDay: boolean;
  kind: EventKind;
  /** Birthdays always repeat yearly, whatever this says. */
  repeat: Repeat;
  /** Last date (`yyyy-MM-dd`, inclusive) a repeat may start on; empty = repeats forever. */
  repeatUntil: string;
  owner: UserId;
}

export type EventInput = Omit<CalendarEvent, 'id'>;

/** One visible instance of an event in a given range (repeating events and birthdays expand into one per repeat). */
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

/** What an event card shows about its comments: how many, and the newest few, oldest first. */
export interface CommentSummary {
  count: number;
  recent: EventComment[];
}
