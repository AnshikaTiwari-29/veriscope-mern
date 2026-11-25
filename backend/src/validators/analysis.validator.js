const { body, param } = require('express-validator');
const { CATEGORIES, INPUT_TYPES } = require('../config/constants');

const contentRules = [
  body('inputType').optional().isIn(INPUT_TYPES).withMessage('inputType must be text or url'),
  body('sourceUrl').optional({ values: 'falsy' }).trim().isURL({ require_protocol: true }).withMessage('Enter a valid URL (https://...)'),
  body('content')
    .optional({ values: 'falsy' }).trim().isLength({ max: 5000 }).withMessage('Text cannot exceed 5000 characters'),
  body('content').custom((value, { req }) => {
    if (req.body.inputType === 'url' && req.body.sourceUrl) return true;
    if (!value || value.trim().length < 10) throw new Error('Please enter at least 10 characters');
    return true;
  }),
];

exports.createRules = [
  ...contentRules,
  body('title').optional({ values: 'falsy' }).trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

exports.updateRules = [
  param('id').isMongoId().withMessage('Invalid id'),
  body('title').optional().trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  body('content').optional().trim().isLength({ max: 5000 }).withMessage('Text cannot exceed 5000 characters'),
];

exports.previewRules = contentRules;
exports.idRule = [param('id').isMongoId().withMessage('Invalid id')];
