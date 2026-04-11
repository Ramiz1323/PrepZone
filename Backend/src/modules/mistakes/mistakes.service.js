import { Mistake } from './mistakes.model.js';

export const addMistake = async (userId, payload) => {
  return Mistake.create({ userId, ...payload });
};

export const getMistakes = async (userId, { subject, page = 1, limit = 20 } = {}) => {
  const filter = { userId };
  if (subject) filter.subject = subject;

  const skip = (page - 1) * limit;
  const [mistakes, total] = await Promise.all([
    Mistake.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Mistake.countDocuments(filter),
  ]);

  return { mistakes, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getMistakeById = async (userId, mistakeId) => {
  return Mistake.findOne({ _id: mistakeId, userId }).lean();
};

export const updateMistake = async (userId, mistakeId, updates) => {
  return Mistake.findOneAndUpdate(
    { _id: mistakeId, userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
};

export const deleteMistake = async (userId, mistakeId) => {
  return Mistake.findOneAndDelete({ _id: mistakeId, userId });
};

export const getMistakeAnalytics = async (userId) => {
  const bySubject = await Mistake.aggregate([
    { $match: { userId: new (await import('mongoose')).default.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$subject',
        count: { $sum: 1 },
        totalRepeats: { $sum: '$repeatCount' },
        recentMistake: { $last: '$mistake' },
      },
    },
    { $sort: { count: -1 } },
    { $project: { subject: '$_id', count: 1, totalRepeats: 1, recentMistake: 1, _id: 0 } },
  ]);

  return { bySubject };
};
