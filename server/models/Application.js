const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'],
      default: 'Submitted',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    aiMatchAnalysis: {
      matchScore: { type: Number, default: 0 },
      matchedSkills: [String],
      missingSkills: [String],
      matchReason: { type: String, default: '' },
      recommendedCourses: [String],
      recommendedCertifications: [String],
      analyzedAt: Date,
    },
    recruiterNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
