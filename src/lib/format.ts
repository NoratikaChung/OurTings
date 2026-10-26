/** Clock time in the device's own locale and hour cycle (12- or 24-hour, as the phone shows it). */
const TIME = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

export function formatTime(date: Date) {
  return TIME.format(date);
}
