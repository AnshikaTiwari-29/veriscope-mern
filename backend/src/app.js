const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();
app.set('trust proxy', 1); // needed behind Render / AWS load balancers

// security + parsing
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '50kb' }));
app.use(mongoSanitize()); // blocks NoSQL injection like { "$gt": "" }
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, skip: () => process.env.NODE_ENV === 'test' }));

// routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1', routes);

// errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
