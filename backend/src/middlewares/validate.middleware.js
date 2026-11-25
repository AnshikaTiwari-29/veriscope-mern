const { validationResult } = require('express-validator');

// sends 400 + list of field errors if any validation rule failed
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, msg: e.msg }));
  res.status(400).json({ success: false, message: errors[0].msg, errors });
};
