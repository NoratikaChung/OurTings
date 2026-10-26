import { useState, type FormEvent } from 'react';
import { addHours, format, isToday, startOfHour } from 'date-fns';
import { AlignLeft, ArrowRight, Cake, CalendarDays, CalendarRange, Check, Clock, MapPin, Repeat as RepeatIcon, Sun, Trash2, X } from 'lucide-react';
import { createEvent, deleteEvent, updateEvent } from '../data/events';
import { parseLocal, toLocal } from '../lib/occurrences';
import { REPEAT_NAMES, type CalendarEvent, type EventInput, type Repeat, type UserId } from '../types';
import { Sheet } from './ui';

/** New event at a moment (`timed` = an exact hour was picked), or an existing event. */
export type EditorTarget = { start: Date; timed: boolean } | { event: CalendarEvent };

const REPEAT_CHOICES: { value: Repeat; label: string }[] = [
  { value: 'none', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

function initial(target: EditorTarget, user: UserId): EventInput {
  if ('event' in target) {
    const { id: _id, ...input } = target.event;
    if (input.allDay || input.kind === 'birthday') return input;
    // Timed events are edited in this device's own time (saving then records this device's zone).
    return { ...input, start: toLocal(parseLocal(input.start, input.timeZone)), end: toLocal(parseLocal(input.end, input.timeZone)) };
  }
  let start = new Date(target.start);
  if (!target.timed) {
    if (isToday(start)) start = addHours(startOfHour(new Date()), 1);
    else start.setHours(9, 0, 0, 0);
  }
  return {
    title: '',
    description: '',
    place: '',
    start: toLocal(start),
    end: toLocal(addHours(start, 1)),
    timeZone: '',
    allDay: false,
    kind: 'event',
    repeat: 'none',
    repeatUntil: '',
    owner: user,
  };
}

export function EventEditor({
  target,
  user,
  onClose,
  onSaved,
  onError,
}: {
  target: EditorTarget;
  user: UserId;
  onClose: () => void;
  onSaved: (start: Date) => void;
  onError: (message: string) => void;
}) {
  const existing = 'event' in target ? target.event : null;
  const [draft, setDraft] = useState<EventInput>(() => initial(target, user));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (patch: Partial<EventInput>) => setDraft({ ...draft, ...patch });

  const [startDate, startTime] = draft.start.split('T');
  const [endDate, endTime] = draft.end.split('T');
  const birthday = draft.kind === 'birthday';
  const allDay = draft.allDay || birthday;

  /** Moving the start keeps the duration, so the end never lands before it. */
  const moveStart = (next: string) => {
    if (!next.includes('T') || next.endsWith('T')) return;
    const delta = parseLocal(next).getTime() - parseLocal(draft.start).getTime();
    set({ start: next, end: toLocal(new Date(parseLocal(draft.end).getTime() + delta)) });
  };

  const repeat = birthday ? 'none' : draft.repeat;
  const endsBeforeStart = repeat !== 'none' && draft.repeatUntil !== '' && draft.repeatUntil < startDate;
  const invalid = !draft.title.trim() || (!birthday && draft.end < draft.start) || endsBeforeStart;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    const input: EventInput = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      place: draft.place.trim(),
      allDay,
      end: birthday ? draft.start : draft.end,
      // Dates are the same everywhere; clock times belong to the zone they were entered in.
      timeZone: allDay ? '' : Intl.DateTimeFormat().resolvedOptions().timeZone,
      repeat,
      repeatUntil: repeat === 'none' ? '' : draft.repeatUntil,
    };
    // Don't await: offline writes resolve only after syncing, and the local cache updates instantly.
    (existing ? updateEvent(existing.id, input) : createEvent(input)).catch((err: Error) => onError(err.message));
    onSaved(parseLocal(input.start, input.timeZone));
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    if (!confirmDelete) return setConfirmDelete(true);
    deleteEvent(existing.id).catch((err: Error) => onError(err.message));
    onClose();
  };

  return (
    <Sheet label={existing ? 'Edit event' : 'New event'} onClose={onClose}>
      <form className={`editor owner-${draft.owner}`} onSubmit={save}>
        <input
          className="title-input"
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder={birthday ? 'Whose birthday?' : 'What?'}
          aria-label="Title"
          maxLength={120}
          autoFocus={!existing}
        />

        <div className="seg" role="radiogroup" aria-label="Type">
          <button type="button" role="radio" aria-checked={!birthday} onClick={() => set({ kind: 'event' })}>
            <CalendarDays size={18} /> Event
          </button>
          <button type="button" role="radio" aria-checked={birthday} onClick={() => set({ kind: 'birthday' })}>
            <Cake size={18} /> Birthday
          </button>
        </div>

        {!birthday && (
          <label className="row switch">
            <Sun size={18} aria-hidden="true" />
            <span>All day</span>
            <input type="checkbox" checked={draft.allDay} onChange={(e) => set({ allDay: e.target.checked })} />
          </label>
        )}

        <div className="row">
          <Clock size={18} aria-hidden="true" />
          <input type="date" value={startDate} onChange={(e) => moveStart(`${e.target.value}T${startTime}`)} aria-label="Start date" required />
          {!allDay && <input type="time" value={startTime} onChange={(e) => moveStart(`${startDate}T${e.target.value}`)} aria-label="Start time" required />}
        </div>

        {!birthday && (
          <div className="row" data-invalid={draft.end < draft.start || undefined}>
            <ArrowRight size={18} aria-hidden="true" />
            <input type="date" value={endDate} min={startDate} onChange={(e) => e.target.value && set({ end: `${e.target.value}T${endTime}` })} aria-label="End date" required />
            {!allDay && <input type="time" value={endTime} onChange={(e) => e.target.value && set({ end: `${endDate}T${e.target.value}` })} aria-label="End time" required />}
          </div>
        )}

        {!birthday && (
          <div className="row">
            <RepeatIcon size={18} aria-hidden="true" />
            <div className="seg repeat-seg" role="radiogroup" aria-label="Repeat">
              {REPEAT_CHOICES.map(({ value, label }) => (
                <button key={value} type="button" role="radio" aria-checked={draft.repeat === value} onClick={() => set({ repeat: value })}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {repeat !== 'none' && (
          <>
            <div className="row repeat-range" data-invalid={endsBeforeStart || undefined}>
              <CalendarRange size={18} aria-hidden="true" />
              <label>
                Starts
                <input type="date" value={startDate} onChange={(e) => moveStart(`${e.target.value}T${startTime}`)} required />
              </label>
              <label>
                Ends
                <input type="date" value={draft.repeatUntil} min={startDate} onChange={(e) => set({ repeatUntil: e.target.value })} />
              </label>
              {draft.repeatUntil && (
                <button type="button" className="icon-btn" onClick={() => set({ repeatUntil: '' })} aria-label="No end date">
                  <X size={18} />
                </button>
              )}
            </div>
            <p className="repeat-summary">
              {REPEAT_NAMES[repeat]} from {format(parseLocal(startDate), 'd MMM yyyy')}
              {draft.repeatUntil ? ` until ${format(parseLocal(draft.repeatUntil), 'd MMM yyyy')}` : ', with no end'}
            </p>
          </>
        )}

        <div className="row">
          <MapPin size={18} aria-hidden="true" />
          <input value={draft.place} onChange={(e) => set({ place: e.target.value })} placeholder="Where?" aria-label="Place" maxLength={200} />
        </div>

        <div className="row">
          <AlignLeft size={18} aria-hidden="true" />
          <textarea value={draft.description} onChange={(e) => set({ description: e.target.value })} placeholder="Notes" aria-label="Description" rows={3} maxLength={2000} />
        </div>

        <footer className="sheet-actions">
          {existing && (
            <button type="button" className={`icon-btn danger ${confirmDelete ? 'armed' : ''}`} onClick={remove} aria-label={confirmDelete ? 'Tap again to delete' : 'Delete'}>
              <Trash2 size={20} />
              {confirmDelete && <span>Sure?</span>}
            </button>
          )}
          <span className="when-preview">{format(parseLocal(draft.start), birthday ? 'd MMM' : 'EEE d MMM')}</span>
          <button type="submit" className="round-btn" disabled={invalid} aria-label="Save">
            <Check size={24} />
          </button>
        </footer>
      </form>
    </Sheet>
  );
}
