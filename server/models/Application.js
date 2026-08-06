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
      enum: [
        'Submitted',
        'Reviewed',
        'Shortlisted',
        'Interview',
        'Technical Round',
        'HR Round',
        'Offer',
        'Joined',
        'Rejected',
        'Withdrawn',
      ],
      default: 'Submitted',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    aiMatchAnalysis: {
      matchScore: { type: Number, default: 85 },
      technicalMatchScore: { type: Number, default: 88 },
      experienceMatchScore: { type: Number, default: 82 },
      skillMatchScore: { type: Number, default: 90 },
      educationMatchScore: { type: Number, default: 85 },
      communicationScore: { type: Number, default: 87 },
      matchedSkills: [String],
      missingSkills: [String],
      topStrengths: [String],
      weakAreas: [String],
      hiringRecommendation: { type: String, default: 'Strong Hire' },
      recommendedInterviewQuestions: [String],
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
