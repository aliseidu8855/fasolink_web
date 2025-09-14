// Utility for formatting relative times in a lightweight way with i18n support.
// Uses Intl.RelativeTimeFormat when available; falls back to a simple English string.
// Accepts a Date, timestamp number, or ISO string.

const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' }, // approx weeks per month
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
];

export function formatRelativeTime(input, locale = 'en') {
  if (!input) return '';
  let date;
  if (input instanceof Date) date = input;
  else if (typeof input === 'number') date = new Date(input);
  else date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  let diff = (date.getTime() - now.getTime()) / 1000; // seconds diff
  const rtf = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat
    ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    : null;

  for (const division of DIVISIONS) {
    if (Math.abs(diff) < division.amount) {
      const value = Math.round(diff);
      if (rtf) {
        return rtf.format(value, division.name.replace(/s$/, ''));
      }
      // Fallback minimal English implementation
      const unit = division.name.replace(/s$/, '');
      if (value === 0) return 'just now';
      const abs = Math.abs(value);
      return value > 0 ? `in ${abs} ${unit}${abs !== 1 ? 's' : ''}` : `${abs} ${unit}${abs !== 1 ? 's' : ''} ago`;
    }
    diff /= division.amount;
  }
  return '';
}

export default formatRelativeTime;
