import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0, min: 0 },
    correct: { type: Number, default: 0, min: 0 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const trackerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD' for easy date lookup
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    // Using a Map for dynamic subjects
    subjects: {
      type: Map,
      of: subjectSchema,
      default: () => new Map()
    },
    totalMCQs: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    timeSpent: { type: Number, default: 0, min: 0 }, // minutes
    weakTopics: [{ type: String, trim: true }],
    notes: { type: String, trim: true, maxlength: 1000 },
    sessions: [{
      subjects: { type: Map, of: subjectSchema },
      totalMCQs: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 },
      notes: { type: String },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Compound unique index — one log per user per day
trackerSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Tracker = mongoose.model('Tracker', trackerSchema);
