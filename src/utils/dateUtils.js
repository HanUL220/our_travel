/**
 * Formats full date strings (e.g. 2026-06-12 or 2026-06-25 ~ 2026-06-28)
 * to 2-digit year format (e.g. 26-06-12 or 26-06-25 ~ 26-06-28).
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';

  return dateStr
    .replace(/\b20(\d{2})-(\d{2})-(\d{2})\b/g, '$1-$2-$3')
    .replace(/\b20(\d{2})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\b/g, (match, y, m, d) => {
      const mm = m.padStart(2, '0');
      const dd = d.padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    });
}
