import { body, param } from 'express-validator';

export const createWalletValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('color')
    .notEmpty()
    .withMessage('Color is required')
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage('Color must be a valid hex code'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS', 'INVESTMENT', 'OTHER'])
    .withMessage('Invalid wallet type'),
  body('initBalance')
    .notEmpty()
    .withMessage('Initial balance is required')
    .isFloat({ min: 0 })
    .withMessage('Initial balance must be a positive number'),
  // body('userId')
  //   .notEmpty()
  //   .withMessage('userId is required')
  //   .trim(),
];

export const updateWalletValidation = [
  param('id')
    .notEmpty()
    .withMessage('Wallet ID is required'),
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .trim(),
  body('color')
    .optional()
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage('Color must be a valid hex code'),
  body('type')
    .optional()
    .isIn(['CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS', 'INVESTMENT', 'OTHER'])
    .withMessage('Invalid wallet type'),
  body('balance')
    .optional()
    .isFloat()
    .withMessage('Balance must be a number'),
  body('initBalance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Initial balance must be positive'),
];