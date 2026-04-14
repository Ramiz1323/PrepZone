import { PracticeTest, QuestionBank, PracticeResult } from './practice.model.js';
import { upsertTrackerEntry } from '../tracker/tracker.service.js';

/**
 * Import a new MCQ test and populate the Global Question Bank
 */
export const importPracticeTest = async (userId, payload) => {
  const { title, subject, topic, questions, isTimed, timeLimit, difficulty } = payload;

  // 1. Create the Practice Test for the user
  const newTest = await PracticeTest.create({
    userId,
    title,
    subject,
    topic,
    questions,
    isTimed,
    timeLimit,
    difficulty,
    totalQuestions: questions.length
  });

  // 2. Shred and Upsert questions into the Global QuestionBank (Subject-based)
  const questionBankEntries = questions.map(q => ({
    subject,
    question: q.question,
    options: q.options,
    answer: q.answer,
    difficulty: difficulty || 'Medium',
    sourceTestId: newTest._id,
    addedBy: userId
  }));

  // Use bulkWrite to avoid duplicates and handle errors gracefully
  const bulkOps = questionBankEntries.map(entry => ({
    updateOne: {
      filter: { subject: entry.subject, question: entry.question },
      update: { $set: entry },
      upsert: true
    }
  }));

  if (bulkOps.length > 0) {
    await QuestionBank.bulkWrite(bulkOps);
  }

  return newTest;
};

/**
 * List tests available for the user
 */
export const getUserTests = async (userId) => {
  return PracticeTest.find({ userId }).sort({ createdAt: -1 }).lean();
};

/**
 * Get a specific test by ID
 */
export const getTestById = async (testId) => {
  return PracticeTest.findById(testId).lean();
};

/**
 * Get the latest result for a specific test (for review)
 */
export const getLatestResultForTest = async (userId, testId) => {
  return PracticeResult.findOne({ userId, testId }).sort({ createdAt: -1 }).lean();
};

/**
 * Submit test results and sync with Dashboard Tracker
 */
export const submitTestResult = async (userId, testId, resultData) => {
  const { score, totalQuestions, timeTaken, date, userAnswers } = resultData;
  const accuracy = totalQuestions > 0 ? parseFloat(((score / totalQuestions) * 100).toFixed(2)) : 0;

  // 1. Save the Test Result
  const result = await PracticeResult.create({
    userId,
    testId,
    score,
    totalQuestions,
    accuracy,
    timeTaken,
    userAnswers,
    date
  });

  // 2. SYNC WITH TRACKER/DASHBOARD
  // This is the "Double-Storage" benefit: automated reporting!
  const test = await PracticeTest.findById(testId);
  if (test) {
    const trackerPayload = {
      date,
      subjects: {
        [test.subject]: {
          total: totalQuestions,
          correct: score
        }
      },
      timeSpent: Math.ceil(timeTaken / 60) // convert seconds to minutes
    };
    
    // Call existing tracker service to update daily stats
    await upsertTrackerEntry(userId, trackerPayload);

    // 3. Update the Test with last attempt info
    await PracticeTest.findByIdAndUpdate(testId, {
      lastAttempt: {
        date: new Date(),
        score,
        accuracy
      }
    });
  }

  return result;
};
