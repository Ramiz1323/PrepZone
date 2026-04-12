import mongoose from 'mongoose';

const dailyPlanSchema = new mongoose.Schema({
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  subject: { type: String, required: true },
  topics: [{ type: String }],
  mcqTarget: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  }
}, { _id: false });

const plannerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Study Plan'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  plans: [dailyPlanSchema],
  lastImported: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure a user doesn't have two plans with the same title
plannerSchema.index({ userId: 1, title: 1 }, { unique: true });

export const Planner = mongoose.model('Planner', plannerSchema);
