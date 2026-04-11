import { body } from 'express-validator';

export const mistakeValidation = [
  body('subject')
    .notEmpty().withMessage('Subject is required')
    .trim(),

  body('mistake')
    .notEmpty().withMessage('Mistake description is required')
    .isLength({ max: 2000 }).withMessage('Mistake cannot exceed 2000 characters'),

  body('correction')
    .optional()
    .isLength({ max: 2000 }).withMessage('Correction cannot exceed 2000 characters'),

  body('topic')
    .optional()
    .isLength({ max: 200 }).withMessage('Topic cannot exceed 200 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];
