const Analysis = require('../models/Analysis');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { analyze, makeTitle } = require('../services/analyzer');

const SORTS = ['-createdAt', 'createdAt', '-score', 'score'];

// helper: find a check and make sure the user owns it (or is admin)
async function getOwnedAnalysis(req) {
  const analysis = await Analysis.findById(req.params.id);
  if (!analysis) throw new ApiError(404, 'Check not found');
  const isOwner = analysis.createdBy.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not allowed');
  return analysis;
}

// GET /analyses?page&limit&search&verdict&category&sort
exports.getAnalyses = asyncHandler(async (req, res) => {
  const { search, verdict, category } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 9, 50);
  const sort = SORTS.includes(req.query.sort) ? req.query.sort : '-createdAt';

  // users see only their own checks; admin sees everything
  const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
  if (verdict) filter.verdict = verdict;
  if (category) filter.category = category;
  if (search) filter.title = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [data, total] = await Promise.all([
    Analysis.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate('createdBy', 'name'),
    Analysis.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
});

// POST /analyses - run the analyzer and save the result
exports.createAnalysis = asyncHandler(async (req, res) => {
  const { inputType, content = '', sourceUrl = '', title, category, notes } = req.body;
  const result = analyze(content, sourceUrl);

  const analysis = await Analysis.create({
    title: title || makeTitle(content, sourceUrl),
    inputType,
    content,
    sourceUrl,
    category,
    notes,
    score: result.score,
    verdict: result.verdict,
    summary: result.summary,
    signals: result.signals,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, message: 'Analysis complete', data: analysis });
});

// GET /analyses/:id
exports.getAnalysis = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getOwnedAnalysis(req) });
});

// PUT /analyses/:id - edit title/category/notes/content (re-analyses if content changes)
exports.updateAnalysis = asyncHandler(async (req, res) => {
  const analysis = await getOwnedAnalysis(req);
  ['title', 'category', 'notes', 'content', 'sourceUrl'].forEach((key) => {
    if (req.body[key] !== undefined) analysis[key] = req.body[key];
  });

  if (req.body.content !== undefined || req.body.sourceUrl !== undefined) {
    const result = analyze(analysis.content, analysis.sourceUrl);
    Object.assign(analysis, { score: result.score, verdict: result.verdict, summary: result.summary, signals: result.signals });
  }
  await analysis.save();
  res.json({ success: true, message: 'Check updated', data: analysis });
});

// DELETE /analyses/:id
exports.deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await getOwnedAnalysis(req);
  await analysis.deleteOne();
  res.json({ success: true, message: 'Check deleted' });
});

// POST /public/analyze - landing page demo (nothing is saved)
exports.previewAnalysis = asyncHandler(async (req, res) => {
  const { content = '', sourceUrl = '' } = req.body;
  res.json({ success: true, data: analyze(content, sourceUrl) });
});
