/**
 * Returns a consistent vibrant color based on a string (subject name).
 * This ensures the same subject always has the same color during a session.
 */
const VIBRANT_COLORS = [
  '#ef4444', // Red 500
  '#f59e0b', // Amber 500
  '#10b981', // Emerald 500
  '#06b6d4', // Cyan 500
  '#6366f1', // Indigo 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
  '#f43f5e', // Rose 500
  '#14b8a6', // Teal 500
  '#84cc16'  // Lime 500
];

export const getSubjectColor = (subjectName) => {
  // Simple hash function to get an index
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % VIBRANT_COLORS.length;
  return VIBRANT_COLORS[index];
};
