import { Tracker } from '../tracker/tracker.model.js';
import { User } from '../auth/auth.model.js';
import { DEFAULT_SUBJECTS, WEAK_SUBJECT_THRESHOLD, SUBJECT_SUGGESTIONS } from '../../shared/utils/constants.js';
import { env } from '../../shared/config/env.js';
import { logger } from '../../shared/utils/logger.js';

const getRuleBasedSuggestions = (subjectAccuracies) => {
  const suggestions = [];

  Object.entries(subjectAccuracies).forEach(([subject, { accuracy, total }]) => {
    if (total === 0) return;

    const rules = SUBJECT_SUGGESTIONS[subject] || [];
    for (const rule of rules) {
      if (accuracy <= rule.maxAccuracy) {
        suggestions.push({
          subject,
          accuracy: parseFloat(accuracy.toFixed(2)),
          suggestion: rule.suggestion,
          priority: accuracy < 40 ? 'high' : accuracy < 60 ? 'medium' : 'low',
          source: 'rule-based',
        });
        break;
      }
    }
  });

  return suggestions;
};

const getMistralSuggestions = async (subjectAccuracies) => {
  if (!env.MISTRAL_API_KEY) return null;

  try {
    // Filter to only problematic subjects to save tokens
    const problematicSubjects = Object.entries(subjectAccuracies)
      .filter(([_, data]) => data.total > 0 && data.accuracy < WEAK_SUBJECT_THRESHOLD)
      .map(([sub, data]) => `${sub}: ${data.accuracy.toFixed(1)}%`)
      .join(', ');

    if (!problematicSubjects) return []; // Nothing to suggest if high accuracy

    const { Mistral } = await import('@mistralai/mistralai');
    const client = new Mistral({ apiKey: env.MISTRAL_API_KEY });

    const prompt = `Student weak subjects: ${problematicSubjects}. Threshold: ${WEAK_SUBJECT_THRESHOLD}%.
Provide specific study suggestions in JSON array: { "subject": string, "accuracy": number, "suggestion": string, "priority": "high"|"medium"|"low" }.
Be extremely concise. Return ONLY valid JSON array.`;

    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2, // Stable JSON
      maxTokens: 350, // Save credits
    });

    const content = response.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map((item) => ({ ...item, source: 'mistral-ai' }));
  } catch (error) {
    logger.warn(`Mistral optimization failed: ${error.message}`);
    return null;
  }
};

export const getSummary = async (userId) => {
  const user = await User.findById(userId).lean();
  const mongoose = (await import('mongoose')).default;
  const uid = new mongoose.Types.ObjectId(userId);

  // 1. Get overall metrics
  const overallResult = await Tracker.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: null,
        totalMCQs: { $sum: '$totalMCQs' },
        totalDays: { $sum: 1 },
        avgAccuracy: { $avg: '$accuracy' },
        totalTimeSpent: { $sum: '$timeSpent' },
      },
    },
  ]);

  if (!overallResult.length) {
    return {
      totalMCQs: 0, totalDays: 0, avgAccuracy: 0, totalTimeSpent: 0,
      subjectAccuracy: {}, weakSubjects: [], streak: user?.streak || {},
    };
  }

  // 2. Get subject-wise metrics dynamically
  const subjectResult = await Tracker.aggregate([
    { $match: { userId: uid } },
    { $project: { subjectsArr: { $objectToArray: '$subjects' } } },
    { $unwind: '$subjectsArr' },
    {
      $group: {
        _id: '$subjectsArr.k',
        total: { $sum: '$subjectsArr.v.total' },
        correct: { $sum: '$subjectsArr.v.correct' },
      }
    }
  ]);

  const subjectAccuracy = {};
  subjectResult.forEach((res) => {
    const total = res.total;
    const correct = res.correct;
    subjectAccuracy[res._id] = {
      total,
      correct,
      accuracy: total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0,
    };
  });

  const weakSubjects = Object.keys(subjectAccuracy).filter(
    (s) => subjectAccuracy[s].total > 0 && subjectAccuracy[s].accuracy < WEAK_SUBJECT_THRESHOLD
  );

  const r = overallResult[0];
  return {
    totalMCQs: r.totalMCQs,
    totalDays: r.totalDays,
    avgAccuracy: parseFloat((r.avgAccuracy || 0).toFixed(2)),
    totalTimeSpent: r.totalTimeSpent,
    subjectAccuracy,
    weakSubjects,
    streak: user?.streak || {},
    dailyMCQGoal: user?.dailyMCQGoal || 50,
  };
};

export const getWeeklySummary = async (userId, days = 7) => {
  const mongoose = (await import('mongoose')).default;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const logs = await Tracker.find({
    userId: mongoose.Types.ObjectId.createFromHexString(userId),
    date: { $gte: cutoffStr },
  })
    .sort({ date: 1 })
    .lean();

  const user = await User.findById(userId).select('dailyMCQGoal').lean();
  const dailyGoal = user?.dailyMCQGoal || 50;

  return {
    period: `Last ${days} days`,
    totalDays: logs.length,
    totalMCQs: logs.reduce((sum, l) => sum + l.totalMCQs, 0),
    dailyGoal,
    goalMetDays: logs.filter((l) => l.totalMCQs >= dailyGoal).length,
    avgAccuracy: logs.length
      ? parseFloat((logs.reduce((sum, l) => sum + l.accuracy, 0) / logs.length).toFixed(2))
      : 0,
    dailyBreakdown: logs.map((l) => ({
      date: l.date,
      totalMCQs: l.totalMCQs,
      accuracy: l.accuracy,
      timeSpent: l.timeSpent,
      isGoalMet: l.totalMCQs >= dailyGoal,
    })),
  };
};

export const getSuggestions = async (userId) => {
  const summary = await getSummary(userId);
  const { subjectAccuracy, totalMCQs } = summary;

  if (totalMCQs === 0) {
    return { suggestions: [], source: 'rule-based', generatedAt: new Date().toISOString() };
  }

  // AI Credit Optimization Logic
  const user = await User.findById(userId).select('aiCache').lean();
  const cache = user?.aiCache;
  const now = new Date();
  const CACHE_HOURS = 24;
  const MCQ_THRESHOLD = 25;

  const isCacheValid = 
    cache?.generatedAt && 
    (now - new Date(cache.generatedAt)) < CACHE_HOURS * 60 * 60 * 1000 &&
    (totalMCQs - (cache.totalMCQsAtGen || 0)) < MCQ_THRESHOLD;

  if (isCacheValid && cache.suggestions?.length > 0) {
    logger.debug(`[AI Optimization] Serving cached suggestions for user ${userId}`);
    return {
      suggestions: cache.suggestions,
      source: 'mistral-ai',
      generatedAt: cache.generatedAt,
      isCached: true
    };
  }

  const mistralSuggestions = await getMistralSuggestions(subjectAccuracy);
  
  if (mistralSuggestions) {
    // Update cache
    await User.findByIdAndUpdate(userId, {
      $set: {
        'aiCache.suggestions': mistralSuggestions,
        'aiCache.generatedAt': now,
        'aiCache.totalMCQsAtGen': totalMCQs
      }
    });

    return {
      suggestions: mistralSuggestions,
      source: 'mistral-ai',
      generatedAt: now.toISOString(),
      isCached: false
    };
  }

  const ruleSuggestions = getRuleBasedSuggestions(subjectAccuracy);
  return {
    suggestions: ruleSuggestions,
    source: 'rule-based',
    generatedAt: now.toISOString()
  };
};

export const getCalendarData = async (userId, year) => {
  const mongoose = (await import('mongoose')).default;
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const logs = await Tracker.find({
    userId: mongoose.Types.ObjectId.createFromHexString(userId),
    date: { $gte: startDate, $lte: endDate },
  })
    .select('date totalMCQs accuracy')
    .sort({ date: 1 })
    .lean();

  return logs.map((l) => ({
    date: l.date,
    totalMCQs: l.totalMCQs,
    accuracy: l.accuracy,
    level: l.totalMCQs === 0 ? 0 : l.totalMCQs < 20 ? 1 : l.totalMCQs < 50 ? 2 : l.totalMCQs < 100 ? 3 : 4,
  }));
};
