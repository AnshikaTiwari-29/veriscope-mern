const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  if (req.url !== '/health' && req.url !== '/favicon.ico') {
    try {
      await connectDB();
    } catch (err) {
      console.error('Serverless DB error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed: ' + err.message,
      });
    }
  }
  return app(req, res);
};
