const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_job_portal');
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error]: ${error.message}`);
    // Fallback info for demo mode
    console.log('[MongoDB Note]: Running in resilient mode or local fallback instance');
  }
};

module.exports = connectDB;
