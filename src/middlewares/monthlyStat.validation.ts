import { body, param } from 'express-validator';

export const createMonthlyStatValidation = [
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .trim(),
  // body('userId')
  //   .notEmpty()
  //   .withMessage('userId is required')
  //   .trim(),
];

export const updateMonthlyStatValidation = [
  param('id')
    .notEmpty()
    .withMessage('Monthly stat ID is required'),
  body('month')
    .optional()
    .trim(),
];