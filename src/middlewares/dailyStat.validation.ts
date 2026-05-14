import { body, param } from 'express-validator';

export const createDailyStatValidation = [
  body('day')
    .notEmpty()
    .withMessage('Day is required')
    .trim(),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .trim(),
  // body('userId')
  //   .notEmpty()
  //   .withMessage('userId is required')
  //   .trim(),
];

export const updateDailyStatValidation = [
  param('id')
    .notEmpty()
    .withMessage('Daily stat ID is required'),
  body('day')
    .optional()
    .trim(),
  body('date')
    .optional()
    .trim(),
];