const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerRules, loginRules, profileRules, passwordRules } = require('../validators/auth.validator');

router.post('/register', registerRules, validate, c.register);
router.post('/login', loginRules, validate, c.login);
router.get('/me', protect, c.getMe);
router.put('/profile', protect, profileRules, validate, c.updateProfile);
router.put('/change-password', protect, passwordRules, validate, c.changePassword);

module.exports = router;
