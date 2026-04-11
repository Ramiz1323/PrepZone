import mongoose from 'mongoose';
import { PRIORITY_LEVELS, REVISION_STATUS } from '../../shared/utils/constants.js';

const revisionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [300, 'Topic cannot exceed 300 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: { values: PRIORITY_LEVELS, message: 'Invalid priority' },
      default: 'medium',
    },
    status: {
      type: String,
      enum: { values: REVISION_STATUS, message: 'Invalid status' },
      default: 'pending',
    },
    dueDate: {
      type: String, // 'YYYY-MM-DD'
      match: [/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for quick lookup
revisionSchema.index({ userId: 1, status: 1 });
revisionSchema.index({ userId: 1, priority: -1 });

export const Revision = mongoose.model('Revision', revisionSchema);
