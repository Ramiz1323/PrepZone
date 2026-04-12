/**
 * Returns the current date in YYYY-MM-DD format based on the user's local timezone.
 * Avoids the UTC offset issue caused by new Date().toISOString()
 */
export const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
