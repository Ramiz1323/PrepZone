import { Revision } from './revision.model.js';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export const addRevisionItem = async (userId, payload) => {
  return Revision.create({ userId, ...payload });
};

export const getRevisionItems = async (userId, { status, subject, priority } = {}) => {
  const filter = { userId };
  if (status) filter.status = status;
  if (subject) filter.subject = subject;
  if (priority) filter.priority = priority;

  const items = await Revision.find(filter).sort({ createdAt: -1 }).lean();

  return items.sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
  );
};

export const updateRevisionItem = async (userId, id, updates) => {
  if (updates.status === 'completed' && !updates.completedAt) {
    updates.completedAt = new Date();
  }
  return Revision.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
};

export const deleteRevisionItem = async (userId, id) => {
  return Revision.findOneAndDelete({ _id: id, userId });
};

export const getRevisionStats = async (userId) => {
  const mongoose = (await import('mongoose')).default;
  return Revision.aggregate([
    { $match: { userId: mongoose.Types.ObjectId.createFromHexString(userId) } },
    {
      $group: {
        _id: { status: '$status', priority: '$priority' },
        count: { $sum: 1 },
      },
    },
  ]);
};
