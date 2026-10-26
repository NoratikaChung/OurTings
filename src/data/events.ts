import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { CalendarEvent, EventComment, EventInput, UserId } from '../types';

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
            allDay: x.allDay,
            kind: x.kind,
            owner: x.owner,
          };
        }),
      ),
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
  return onSnapshot(
    query(comments(eventId), orderBy('createdAt')),
    (snap) =>
      onData(
        snap.docs.map((d) => {
          const x = d.data({ serverTimestamps: 'estimate' });
          return { id: d.id, text: x.text, author: x.author, createdAt: (x.createdAt as Timestamp | null)?.toDate() ?? null };
        }),
      ),
    onError,
  );
}

export function addComment(eventId: string, text: string, author: UserId) {
  return addDoc(comments(eventId), { text, author, createdAt: serverTimestamp() });
}
