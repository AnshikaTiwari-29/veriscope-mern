const mongoose = require('mongoose');
const { CATEGORIES, VERDICTS, INPUT_TYPES } = require('../config/constants');

// One "check" = one piece of news a user analysed
const analysisSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    inputType: { type: String, enum: INPUT_TYPES, default: 'text' },
    content: { type: String, trim: true, maxlength: 5000, default: '' },
    sourceUrl: { type: String, trim: true, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'other' },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },

    // result from the analyzer
    score: { type: Number, min: 0, max: 100, required: true },
    verdict: { type: String, enum: VERDICTS, required: true },
    summary: String,
    signals: [{ _id: false, key: String, label: String, impact: Number, detail: String }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

analysisSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
