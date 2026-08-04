const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    type: {
      type: String,
      enum: ['Technical', 'Behavioral', 'HR Round', 'Final Round'],
      default: 'Technical',
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/abc-defg-hij',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
    feedback: {
      type: String,
      default: '',
    },
    aiGeneratedQuestions: [
      {
        question: String,
        category: String,
        expectedKeywords: [String],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
