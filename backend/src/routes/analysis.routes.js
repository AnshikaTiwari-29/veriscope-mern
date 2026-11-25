const router = require('express').Router();
const c = require('../controllers/analysis.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createRules, updateRules, idRule } = require('../validators/analysis.validator');

router.use(protect); // every check route needs login

router.route('/').get(c.getAnalyses).post(createRules, validate, c.createAnalysis);
router
  .route('/:id')
  .get(idRule, validate, c.getAnalysis)
  .put(updateRules, validate, c.updateAnalysis)
  .delete(idRule, validate, c.deleteAnalysis);

module.exports = router;
