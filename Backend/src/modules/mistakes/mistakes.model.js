import mongoose from 'mongoose';

const mistakeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    topic: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    mistake: {
      type: String,
      required: [true, 'Mistake description is required'],
      trim: true,
      maxlength: 2000,
    },
    correction: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    tags: [{ type: String, trim: true }],
    repeatCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

mistakeSchema.index({ userId: 1, subject: 1 });

export const Mistake = mongoose.model('Mistake', mistakeSchema);
