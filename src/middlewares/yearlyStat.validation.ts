import { body, param } from 'express-validator';

export const createYearlyStatValidation = [
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .trim(),
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .trim(),
];

export const updateYearlyStatValidation = [
  param('id')
    .notEmpty()
    .withMessage('Yearly stat ID is required'),
  body('year')
    .optional()
    .trim(),
];