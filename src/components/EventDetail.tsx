import { useEffect, useState, type FormEvent } from 'react';
import { format, isSameDay } from 'date-fns';
import { Cake, Clock, MapPin, Pencil, SendHorizontal } from 'lucide-react';
import { Avatar } from '../art/Avatar';
import { addComment, subscribeComments } from '../data/events';
import { parseLocal } from '../lib/occurrences';
import { USER_NAMES, type EventComment, type Occurrence, type Theme, type UserId } from '../types';
import { Sheet } from './ui';

function when({ event, start }: Occurrence) {
  if (event.kind === 'birthday') return format(start, 'EEE d MMM yyyy');
  const s = parseLocal(event.start);
  const e = parseLocal(event.end);
  if (event.allDay) return isSameDay(s, e) ? format(s, 'EEE d MMM yyyy') : `${format(s, 'EEE d MMM')} – ${format(e, 'EEE d MMM yyyy')}`;
  return isSameDay(s, e)
    ? `${format(s, 'EEE d MMM')} · ${format(s, 'h:mm a')} – ${format(e, 'h:mm a')}`
    : `${format(s, 'EEE d MMM, h:mm a')} – ${format(e, 'EEE d MMM, h:mm a')}`;
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
          <div key={c.id} className={`comment owner-${c.author}`}>
            <Avatar user={c.author} theme={theme} size={30} />
            <p>
              {c.text}
              <time>
                {USER_NAMES[c.author]}
                {c.createdAt && ` · ${format(c.createdAt, 'd MMM, h:mm a')}`}
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
