import mongoose from 'mongoose';

// 1. Individual Practice Test (Imported by user)
const practiceTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, index: true },
    topic: { type: String, trim: true },
    questions: [
      {
        question: { type: String, required: true },
        codeSnippet: { type: String },
        options: [{ type: String, required: true }],
        answer: { type: Number, required: true },
      },
    ],
    isTimed: { type: Boolean, default: false },
    timeLimit: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    totalQuestions: { type: Number, required: true },
    lastAttempt: {
      date: { type: Date },
      score: { type: Number },
      accuracy: { type: Number }
    }
  },
  { timestamps: true }
);

// 2. Global Question Bank (Aggregated by Subject)
const questionBankSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, index: true },
    question: { type: String, required: true },
    codeSnippet: { type: String },
    options: [{ type: String, required: true }],
    answer: { type: Number, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    sourceTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticeTest' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// 3. Practice Results (Attempt History)
const practiceResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticeTest', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeTaken: { type: Number, required: true }, // in seconds or minutes
    userAnswers: [{ type: Number }], 
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

// Indexes for performance
questionBankSchema.index({ subject: 1, question: 1 }, { unique: true }); // Prevent exact duplicate questions in bank

export const PracticeTest = mongoose.model('PracticeTest', practiceTestSchema);
export const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);
export const PracticeResult = mongoose.model('PracticeResult', practiceResultSchema);
