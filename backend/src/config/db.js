const mongoose = require('mongoose');

let cachedPromise = null;

module.exports = async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(process.env.MONGO_URI)
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
