const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    parsedData: {
      extractedSkills: [String],
      totalExperienceYears: Number,
      parsedAt: Date,
    },
    summary: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
