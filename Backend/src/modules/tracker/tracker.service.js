import { Tracker } from './tracker.model.js';
import { User } from '../auth/auth.model.js';
import {
  calculateSubjectStats,
  detectWeakTopics,
  calculateStreak,
} from './tracker.utils.js';

export const upsertTrackerEntry = async (userId, payload) => {
  const { date, subjects = {}, timeSpent = 0, weakTopics = [], notes = '' } = payload;

  const { processedSubjects: incomingSubjects, totalMCQs: incomingTotal, overallAccuracy: incomingAccuracy } = calculateSubjectStats(subjects);
  
  const existing = await Tracker.findOne({ userId, date });

  if (existing) {
    // 1. Merge subjects into existing Map
    for (const [subName, newData] of Object.entries(incomingSubjects)) {
      const old = existing.subjects.get(subName) || { total: 0, correct: 0 };
      const mergedTotal = old.total + newData.total;
      const mergedCorrect = old.correct + newData.correct;
      
      existing.subjects.set(subName, {
        total: mergedTotal,
        correct: mergedCorrect,
        accuracy: mergedTotal > 0 ? parseFloat(((mergedCorrect / mergedTotal) * 100).toFixed(2)) : 0
      });
    }

    // 2. Increment daily totals
    existing.totalMCQs += incomingTotal;
    existing.timeSpent += timeSpent;

    // 3. Recalculate daily accuracy based on aggregated subjects
    let dayTotal = 0;
    let dayCorrect = 0;
    existing.subjects.forEach((data) => {
      dayTotal += data.total;
      dayCorrect += data.correct;
    });
    existing.accuracy = dayTotal > 0 ? parseFloat(((dayCorrect / dayTotal) * 100).toFixed(2)) : 0;

    // 4. Merge topics and notes
    const autoDetected = detectWeakTopics(Object.fromEntries(existing.subjects));
    existing.weakTopics = [...new Set([...existing.weakTopics, ...autoDetected, ...weakTopics])];
    
    if (notes) {
      existing.notes = existing.notes ? `${existing.notes} | ${notes}` : notes;
    }

    // 5. Add to sessions list
    existing.sessions.push({
      subjects: incomingSubjects,
      totalMCQs: incomingTotal,
      timeSpent,
      notes,
      timestamp: new Date()
    });

    // 6. Update user XP and streak
    const user = await User.findById(userId);
    if (user) {
      const baseXP = (incomingTotal * 10) + (timeSpent * 1);
      const accuracyMultiplier = incomingAccuracy >= 80 ? 1.2 : 1.0;
      const xpEarned = Math.round(baseXP * accuracyMultiplier);
      
      user.xp = (user.xp || 0) + xpEarned;
      if (user.xp >= user.level * 1000) {
        user.level += 1;
      }

      user.streak = calculateStreak(user.streak, date);
      await user.save({ validateModifiedOnly: true });
    }

    await existing.save();

    return { log: existing, user };
  }

  // If no existing log, create new one (current logic)
  const autoDetectedWeakTopics = detectWeakTopics(incomingSubjects);
  const mergedWeakTopics = [...new Set([...autoDetectedWeakTopics, ...weakTopics])];

  const entry = await Tracker.create({
    userId,
    date,
    subjects: incomingSubjects,
    totalMCQs: incomingTotal,
    accuracy: incomingAccuracy,
    timeSpent,
    weakTopics: mergedWeakTopics,
    notes,
    sessions: [{
      subjects: incomingSubjects,
      totalMCQs: incomingTotal,
      timeSpent,
      notes,
      timestamp: new Date()
    }]
  });

  const user = await User.findById(userId);
  if (user) {
    // Calculate XP for new entry
    const baseXP = (incomingTotal * 10) + (timeSpent * 1);
    const accuracyMultiplier = incomingAccuracy >= 80 ? 1.2 : 1.0;
    const xpEarned = Math.round(baseXP * accuracyMultiplier);
    
    user.xp = (user.xp || 0) + xpEarned;
    
    // Check level up
    if (user.xp >= user.level * 1000) {
      user.level += 1;
    }

    user.streak = calculateStreak(user.streak, date);
    await user.save({ validateModifiedOnly: true });
  }

  return { log: entry, user };
};

export const getUserLogs = async (userId, limit = 30, skip = 0) => {
  return Tracker.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit).lean();
};

export const getLogByDate = async (userId, date) => {
  return Tracker.findOne({ userId, date }).lean();
};

export const getLogsByRange = async (userId, startDate, endDate) => {
  return Tracker.find({ userId, date: { $gte: startDate, $lte: endDate } })
    .sort({ date: 1 })
    .lean();
};

export const deleteLog = async (userId, date) => {
  return Tracker.findOneAndDelete({ userId, date });
};
