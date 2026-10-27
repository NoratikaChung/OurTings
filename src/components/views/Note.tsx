import { useLayoutEffect, useRef, useState } from 'react';
import { Cake, MapPin, Repeat } from 'lucide-react';
import { Avatar } from '../../art/Avatar';
import { formatTime } from '../../lib/format';
import { isAllDay } from '../../lib/occurrences';
import { USER_NAMES, type CalendarEvent, type CommentSummary, type Occurrence, type Theme } from '../../types';

export interface ViewProps {
  events: CalendarEvent[];
  comments: Map<string, CommentSummary>;
  theme: Theme;
  cursor: Date;
  onSelect: (day: Date) => void;
  onOpen: (o: Occurrence) => void;
  onCreate: (start: Date, end?: Date) => void;
}

/** Narrower than this, a comment bubble can't show a readable line. */
const MIN_BUBBLE_WIDTH = 120;

/**
 * Event card coloured by whose calendar it is on: time, title, place, notes and the newest comments as speech
 * bubbles, each cut short with "…" (the full text is in the event sheet). In a short or narrow timetable slot the
 * card shows only the newest bubbles that fit, and when not even one fits, the latest commenter's icon with a
 * comment-count badge.
 * `compact` shows just the title, for the all-day strip.
 */
export function Note({
  o,
  comments,
  theme,
  onOpen,
  compact = false,
}: {
  o: Occurrence;
  comments?: CommentSummary;
  theme: Theme;
  onOpen: (o: Occurrence) => void;
  compact?: boolean;
}) {
  const { event } = o;
  const repeats = event.kind === 'birthday' || event.repeat !== 'none';
  const card = useRef<HTMLButtonElement>(null);
  /** How many of the newest bubbles fit: Infinity = all (with the "+N earlier" line), 0 = none (badge instead). */
  const [fit, setFit] = useState(Number.POSITIVE_INFINITY);

  // Bubbles that don't fit stay laid out (hidden, out of flow), so the card can tell when it grows enough to show
  // them again. Watching the list too catches its text reflowing (the web font arriving after the first check, a
  // comment edited); the observer also fires once on start, before paint. The room is measured from the line above
  // the list, not the list itself: taken out of flow, the list jumps to the card's top, which would read as room
  // to show it, then not, flickering between bubbles and badge every frame.
  useLayoutEffect(() => {
    const el = card.current;
    const list = el?.querySelector<HTMLElement>('.note-comments');
    if (!el || !list) return;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth < MIN_BUBBLE_WIDTH) return setFit(0);
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
      const above = list.previousElementSibling as HTMLElement;
      const top =
        above.offsetTop + above.offsetHeight + parseFloat(getComputedStyle(el).rowGap) + parseFloat(getComputedStyle(list).marginTop);
      const room = el.clientHeight - parseFloat(getComputedStyle(el).paddingBottom) - top;
      const items = [...list.children].map((item) => (item as HTMLElement).offsetHeight);
      if (items.reduce((sum, h) => sum + h, 0) + gap * (items.length - 1) <= room) return setFit(Number.POSITIVE_INFINITY);
      const bubbles = [...list.querySelectorAll<HTMLElement>('.bubble')].reverse();
      let used = 0;
      let shown = 0;
      for (const bubble of bubbles) {
        used += bubble.offsetHeight + (shown ? gap : 0);
        if (used > room) break;
        shown++;
      }
      setFit(shown);
    });
    observer.observe(el);
    observer.observe(list);
    return () => observer.disconnect();
  }, [comments]);

  const recent = comments?.recent ?? [];
  const cramped = recent.length > 0 && fit === 0;
  const latest = recent[recent.length - 1];
  return (
    <button
      ref={card}
      type="button"
      className={`note owner-${event.owner}`}
      data-compact={compact || undefined}
      data-cramped={cramped || undefined}
      onClick={(e) => (e.stopPropagation(), onOpen(o))}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {!compact && (
        <span className="note-time">
          {isAllDay(o) ? (
            'All day'
          ) : (
            <>
              <span>{formatTime(o.start)}</span>
              <span className="note-end">– {formatTime(o.end)}</span>
            </>
          )}
          {repeats && <Repeat size={11} aria-label="Repeats" />}
        </span>
      )}
      <span className="note-title">
        {event.kind === 'birthday' && <Cake size={14} aria-label="Birthday" />}
        {event.title}
      </span>
      {!compact && event.place && (
        <span className="note-place">
          <MapPin size={11} aria-hidden="true" />
          {event.place}
        </span>
      )}
      {!compact && event.description && <span className="note-notes">{event.description}</span>}
      {!compact && comments && (
        <span className="note-comments">
          {comments.count > comments.recent.length && (
            <span className="note-earlier" data-off={fit !== Number.POSITIVE_INFINITY || undefined}>
              +{comments.count - comments.recent.length} earlier
            </span>
          )}
          {comments.recent.map((c, i) => (
            <span key={c.id} className={`bubble owner-${c.author}`} data-off={i < recent.length - fit || undefined}>
              <Avatar user={c.author} theme={theme} size={14} />
              <span className="bubble-text">
                <b>{USER_NAMES[c.author]}</b>: {c.text}
              </span>
            </span>
          ))}
        </span>
      )}
      {!compact && comments && latest && cramped && (
        <span className={`note-badge owner-${latest.author}`} aria-hidden="true">
          <Avatar user={latest.author} theme={theme} size={18} />
          <span className="note-badge-count">{comments.count}</span>
        </span>
      )}
    </button>
  );
}
