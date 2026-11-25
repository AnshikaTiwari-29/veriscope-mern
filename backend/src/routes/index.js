const router = require('express').Router();
const validate = require('../middlewares/validate.middleware');
const { previewRules } = require('../validators/analysis.validator');
const { previewAnalysis } = require('../controllers/analysis.controller');

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/analyses', require('./analysis.routes'));
router.use('/dashboard', require('./dashboard.routes'));

// public demo used on the landing page (no login, nothing saved)
router.post('/public/analyze', previewRules, validate, previewAnalysis);

module.exports = router;
