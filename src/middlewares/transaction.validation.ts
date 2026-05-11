import { body, param } from 'express-validator';

export const createTransactionValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim(),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Time must be in HH:mm format'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['INCOME', 'EXPENSE'])
    .withMessage('Type must be INCOME or EXPENSE'),
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .trim(),
  body('walletId')
    .notEmpty()
    .withMessage('walletId is required')
    .trim(),
  body('description')
    .optional()
    .trim(),
];

export const updateTransactionValidation = [
  param('id')
    .notEmpty()
    .withMessage('Transaction ID is required'),
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .trim(),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('time')
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Time must be in HH:mm format'),
  body('type')
    .optional()
    .isIn(['INCOME', 'EXPENSE'])
    .withMessage('Type must be INCOME or EXPENSE'),
  body('description')
    .optional()
    .trim(),
];