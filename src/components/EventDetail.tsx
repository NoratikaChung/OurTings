import { useEffect, useState, type FormEvent } from 'react';
import { addDays, format, isSameDay } from 'date-fns';
import { Cake, Clock, Globe, MapPin, Pencil, Repeat, SendHorizontal } from 'lucide-react';
import { Avatar } from '../art/Avatar';
import { addComment, subscribeComments } from '../data/events';
import { formatTime } from '../lib/format';
import { isAllDay, parseLocal } from '../lib/occurrences';
import { REPEAT_NAMES, USER_NAMES, type EventComment, type Occurrence, type Theme, type UserId } from '../types';
import { Sheet } from './ui';

/** This occurrence's dates and times, in this device's zone. */
function when({ event, start, end }: Occurrence) {
  if (event.kind === 'birthday') return format(start, 'EEE d MMM yyyy');
  if (event.allDay) {
    const last = addDays(end, -1); // the span ends at the start of the day after
    return isSameDay(start, last) ? format(start, 'EEE d MMM yyyy') : `${format(start, 'EEE d MMM')} – ${format(last, 'EEE d MMM yyyy')}`;
  }
  return isSameDay(start, end)
    ? `${format(start, 'EEE d MMM')} · ${formatTime(start)} – ${formatTime(end)}`
    : `${format(start, 'EEE d MMM')}, ${formatTime(start)} – ${format(end, 'EEE d MMM')}, ${formatTime(end)}`;
}

export function EventDetail({
  occurrence,
  user,
  theme,
  onClose,
  onEdit,
}: {
  occurrence: Occurrence;
  user: UserId;
  theme: Theme;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { event } = occurrence;
  // Shown when the event was entered somewhere else, e.g. "6:00 PM in Kuala Lumpur".
  const elsewhere =
    !isAllDay(occurrence) && event.timeZone && event.timeZone !== Intl.DateTimeFormat().resolvedOptions().timeZone
      ? `${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: event.timeZone }).format(occurrence.start)} in ${event.timeZone.split('/').pop()!.replace(/_/g, ' ')}`
      : null;
  const [comments, setComments] = useState<EventComment[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeComments(event.id, setComments, (e) => setError(e.message)), [event.id]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    addComment(event.id, value, user).catch((err: Error) => setError(err.message));
    setText('');
  };

  return (
    <Sheet label={event.title} onClose={onClose}>
      <article className={`sticky owner-${event.owner}`}>
        <header>
          <Avatar user={event.owner} theme={theme} size={40} />
          <h2>
            {event.kind === 'birthday' && <Cake size={20} aria-label="Birthday" />} {event.title}
          </h2>
        </header>
        <p>
          <Clock size={16} aria-hidden="true" /> {when(occurrence)}
        </p>
        {elsewhere && (
          <p>
            <Globe size={16} aria-hidden="true" /> {elsewhere}
          </p>
        )}
        {event.kind === 'event' && event.repeat !== 'none' && (
          <p>
            <Repeat size={16} aria-hidden="true" /> {REPEAT_NAMES[event.repeat]}
            {event.repeatUntil && ` until ${format(parseLocal(event.repeatUntil), 'd MMM yyyy')}`}
          </p>
        )}
        {event.place && (
          <p>
            <MapPin size={16} aria-hidden="true" /> {event.place}
          </p>
        )}
        {event.description && <p className="desc">{event.description}</p>}
        <button type="button" className="icon-btn sticky-edit" onClick={onEdit} aria-label="Edit">
          <Pencil size={18} />
        </button>
      </article>

      <section className="comments" aria-label="Comments">
        {comments.map((c) => (
          <div key={c.id} className={`comment owner-${c.author}`} data-mine={c.author === user || undefined}>
            <Avatar user={c.author} theme={theme} size={30} />
            <p>
              {c.text}
              <time>
                {USER_NAMES[c.author]}
                {c.createdAt && ` · ${format(c.createdAt, 'd MMM')}, ${formatTime(c.createdAt)}`}
              </time>
            </p>
          </div>
        ))}
        {error && <p className="banner" role="alert">{error}</p>}
        <form className="comment-form" onSubmit={send}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something…" aria-label="Comment" maxLength={1000} />
          <button type="submit" className="round-btn small" disabled={!text.trim()} aria-label="Send">
            <SendHorizontal size={18} />
          </button>
        </form>
      </section>
    </Sheet>
  );
}
