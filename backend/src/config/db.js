const mongoose = require('mongoose');

let cachedPromise = null;

module.exports = async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((err) => {
        cachedPromise = null;
        throw err;
      });
  }

  return cachedPromise;
};
