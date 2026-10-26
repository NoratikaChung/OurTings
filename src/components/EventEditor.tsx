import { useState, type FormEvent } from 'react';
import { addHours, format, isToday, startOfHour } from 'date-fns';
import { AlignLeft, ArrowRight, Cake, CalendarDays, Check, Clock, MapPin, Sun, Trash2 } from 'lucide-react';
import { createEvent, deleteEvent, updateEvent } from '../data/events';
import { parseLocal, toLocal } from '../lib/occurrences';
import type { CalendarEvent, EventInput, UserId } from '../types';
import { Sheet } from './ui';

/** New event at a moment (`timed` = an exact hour was picked), or an existing event. */
export type EditorTarget = { start: Date; timed: boolean } | { event: CalendarEvent };

function initial(target: EditorTarget, user: UserId): EventInput {
  if ('event' in target) {
    const { id: _id, ...input } = target.event;
    return input;
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
    allDay: false,
    kind: 'event',
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

  const invalid = !draft.title.trim() || (!birthday && draft.end < draft.start);

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
    };
    // Don't await: offline writes resolve only after syncing, and the local cache updates instantly.
    (existing ? updateEvent(existing.id, input) : createEvent(input)).catch((err: Error) => onError(err.message));
    onSaved(parseLocal(input.start));
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
