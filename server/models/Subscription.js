const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['Free', 'Recruiter Pro', 'Enterprise AI'],
      default: 'Free',
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled', 'Expired'],
      default: 'Active',
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    aiCredits: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
