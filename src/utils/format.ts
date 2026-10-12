const LOCALE = 'en-MY';

export function isIncoming(amount: number): boolean {
  return amount >= 0;
}

/** `+ RM 1,500.00` / `− RM 500.00` */
export function formatAmount(amount: number): string {
  const sign = isIncoming(amount) ? '+ ' : '− ';
  const value = Math.abs(amount).toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}RM ${value}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
}

/** `15 Oct · 8:34 pm` */
export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })} · ${formatTime(date)}`;
}

/** `15 October 2024, 8:34 pm` */
export function formatDateLong(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
  return `${day}, ${formatTime(date)}`;
}

/** `John Doe` → `JD` */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
}
