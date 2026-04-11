import { body } from 'express-validator';

export const trackerValidation = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD format'),

  body('subjects')
    .optional()
    .isObject().withMessage('Subjects must be an object'),

  // Custom validation for dynamic subjects if provided
  body('subjects').optional().custom((subjects) => {
    for (const [key, value] of Object.entries(subjects)) {
      const total = Number(value.total);
      const correct = Number(value.correct);

      if (isNaN(total) || total < 0) {
        throw new Error(`${key}.total must be a non-negative number`);
      }
      if (value.correct !== undefined && (isNaN(correct) || correct < 0 || correct > total)) {
        throw new Error(`${key}.correct must be between 0 and total`);
      }
    }
    return true;
  }),

  body('timeSpent')
    .optional()
    .isInt({ min: 0 }).withMessage('timeSpent must be a non-negative integer (minutes)'),

  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),

  body('weakTopics')
    .optional()
    .isArray().withMessage('weakTopics must be an array'),
];
