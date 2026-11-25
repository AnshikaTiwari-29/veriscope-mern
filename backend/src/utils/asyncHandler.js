// Wraps async controllers so thrown errors reach the central error middleware (no try/catch everywhere)
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
