const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
