const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  if (req.url !== '/health' && req.url !== '/favicon.ico') {
    await connectDB();
  }
  return app(req, res);
};
