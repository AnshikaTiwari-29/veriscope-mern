const router = require('express').Router();
const c = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { idRule } = require('../validators/analysis.validator');

// every route here is admin only
router.use(protect, restrictTo('admin'));

router.get('/', c.getUsers);
router.patch('/:id', idRule, validate, c.updateUser);
router.delete('/:id', idRule, validate, c.deleteUser);

module.exports = router;
