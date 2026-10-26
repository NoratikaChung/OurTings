import { format } from 'date-fns';
import { Cake, MapPin } from 'lucide-react';
import { isAllDay } from '../../lib/occurrences';
import type { CalendarEvent, Occurrence } from '../../types';

export interface ViewProps {
  events: CalendarEvent[];
  cursor: Date;
  onSelect: (day: Date) => void;
  onOpen: (o: Occurrence) => void;
  onCreate: (start: Date) => void;
}

/** Sticky-note chip for one occurrence, coloured by whose calendar it is on. */
export function Note({ o, onOpen, detail = false }: { o: Occurrence; onOpen: (o: Occurrence) => void; detail?: boolean }) {
  const { event } = o;
  return (
    <button
      type="button"
      className={`note owner-${event.owner}`}
      onClick={(e) => (e.stopPropagation(), onOpen(o))}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="note-title">
        {event.kind === 'birthday' && <Cake size={14} aria-label="Birthday" />}
        {event.title}
      </span>
      {!isAllDay(o) && <span className="note-time">{format(o.start, 'h:mm a')}</span>}
      {detail && event.place && (
        <span className="note-place">
          <MapPin size={12} aria-hidden="true" />
          {event.place}
        </span>
      )}
    </button>
  );
}
