import { WEAK_SUBJECT_THRESHOLD, STREAK_GRACE_DAYS } from '../../shared/utils/constants.js';

export const calculateSubjectStats = (subjects = {}) => {
  let totalMCQs = 0;
  let totalCorrect = 0;
  const processedSubjects = {};

  // If subjects is a Map (from Mongoose), convert to object or iterate properly
  const subjectEntries = subjects instanceof Map ? Array.from(subjects.entries()) : Object.entries(subjects);

  subjectEntries.forEach(([sub, data]) => {
    const total = Math.max(0, parseInt(data.total || data.mcqsDone || 0, 10));
    const correct = Math.max(0, Math.min(parseInt(data.correct || 0, 10), total));
    const accuracy = total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0;

    processedSubjects[sub] = { total, correct, accuracy };
    totalMCQs += total;
    totalCorrect += correct;
  });

  const overallAccuracy =
    totalMCQs > 0 ? parseFloat(((totalCorrect / totalMCQs) * 100).toFixed(2)) : 0;

  return { processedSubjects, totalMCQs, overallAccuracy };
};

export const detectWeakTopics = (processedSubjects) => {
  return Object.keys(processedSubjects).filter((sub) => {
    const s = processedSubjects[sub];
    return s && s.total > 0 && s.accuracy < WEAK_SUBJECT_THRESHOLD;
  });
};

export const calculateStreak = (currentStreak = {}, newDateStr) => {
  const current = currentStreak?.current || 0;
  const longest = currentStreak?.longest || 0;
  const lastActive = currentStreak?.lastActiveDate
    ? new Date(currentStreak.lastActiveDate)
    : null;

  const today = new Date(newDateStr);
  today.setHours(0, 0, 0, 0);

  if (!lastActive) {
    return { current: 1, longest: Math.max(1, longest), lastActiveDate: today };
  }

  const lastDay = new Date(lastActive);
  lastDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - lastDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { current, longest, lastActiveDate: lastDay };
  }

  if (diffDays <= 1 + STREAK_GRACE_DAYS) {
    const newCurrent = current + 1;
    return {
      current: newCurrent,
      longest: Math.max(newCurrent, longest),
      lastActiveDate: today,
    };
  }

  // Streak broken
  return { current: 1, longest: Math.max(1, longest), lastActiveDate: today };
};
