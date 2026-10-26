import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { CalendarEvent, CommentSummary, EventComment, EventInput, UserId } from '../types';

const events = collection(db, 'events');
const comments = (eventId: string) => collection(db, 'events', eventId, 'comments');

export function subscribeEvents(onData: (events: CalendarEvent[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    events,
    (snap) =>
      onData(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            title: x.title,
            description: x.description,
            place: x.place,
            start: x.start,
            end: x.end,
            // Events saved before zones and repeats existed have neither field.
            timeZone: x.timeZone ?? '',
            allDay: x.allDay,
            kind: x.kind,
            repeat: x.repeat ?? 'none',
            repeatUntil: x.repeatUntil ?? '',
            owner: x.owner,
          };
        }),
      ),
    onError,
  );
}

function toComment(d: QueryDocumentSnapshot<DocumentData>): EventComment {
  const x = d.data({ serverTimestamps: 'estimate' });
  return { id: d.id, text: x.text, author: x.author, createdAt: (x.createdAt as Timestamp | null)?.toDate() ?? null };
}

/** How many of an event's newest comments its card shows as speech bubbles. */
const CARD_COMMENTS = 2;

/** Comment count and newest comments per event id, live, for the event cards. */
export function subscribeCommentSummaries(onData: (byEvent: Map<string, CommentSummary>) => void, onError: (e: Error) => void) {
  return onSnapshot(
    collectionGroup(db, 'comments'),
    (snap) => {
      const byEvent = new Map<string, EventComment[]>();
      for (const d of snap.docs) {
        const eventId = d.ref.parent.parent?.id;
        if (!eventId) continue;
        const list = byEvent.get(eventId);
        if (list) list.push(toComment(d));
        else byEvent.set(eventId, [toComment(d)]);
      }
      const summaries = new Map<string, CommentSummary>();
      for (const [eventId, list] of byEvent) {
        // A comment still waiting for its server time is the newest.
        list.sort((a, b) => (a.createdAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.createdAt?.getTime() ?? Number.MAX_SAFE_INTEGER));
        summaries.set(eventId, { count: list.length, recent: list.slice(-CARD_COMMENTS) });
      }
      onData(summaries);
    },
    onError,
  );
}

export function createEvent(input: EventInput) {
  return addDoc(events, { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function updateEvent(id: string, input: EventInput) {
  return updateDoc(doc(events, id), { ...input, updatedAt: serverTimestamp() });
}

/** Firestore does not cascade, so comments are removed with the event. */
export async function deleteEvent(id: string) {
  const batch = writeBatch(db);
  (await getDocs(comments(id))).forEach((c) => batch.delete(c.ref));
  batch.delete(doc(events, id));
  await batch.commit();
}

export function subscribeComments(
  eventId: string,
  onData: (comments: EventComment[]) => void,
  onError: (e: Error) => void,
) {
  return onSnapshot(query(comments(eventId), orderBy('createdAt')), (snap) => onData(snap.docs.map(toComment)), onError);
}

export function addComment(eventId: string, text: string, author: UserId) {
  return addDoc(comments(eventId), { text, author, createdAt: serverTimestamp() });
}
