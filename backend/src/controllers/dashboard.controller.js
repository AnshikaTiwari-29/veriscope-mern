const Analysis = require('../models/Analysis');
const asyncHandler = require('../utils/asyncHandler');
const { VERDICTS } = require('../config/constants');

// GET /dashboard/stats - counts per verdict, average score, overall totals
exports.getStats = asyncHandler(async (req, res) => {
  const match = req.user.role === 'admin' ? {} : { createdBy: req.user._id };

  const [byVerdict, totals, byCategory, recent] = await Promise.all([
    Analysis.aggregate([{ $match: match }, { $group: { _id: '$verdict', count: { $sum: 1 } } }]),
    Analysis.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: 1 }, avgScore: { $avg: '$score' } } }]),
    Analysis.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Analysis.find(match).sort('-createdAt').limit(5).select('title score verdict createdAt'),
  ]);

  const counts = Object.fromEntries(byVerdict.map((v) => [v._id, v.count]));
  res.json({
    success: true,
    data: {
      total: totals[0]?.total || 0,
      avgScore: Math.round(totals[0]?.avgScore || 0),
      flagged: (counts.misleading || 0) + (counts.false || 0),
      byVerdict: VERDICTS.map((v) => ({ verdict: v, count: counts[v] || 0 })),
      byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
      recent,
    },
  });
});
