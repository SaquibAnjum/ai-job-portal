const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    roleCategory: {
      type: String,
      default: 'Full Stack Development',
    },
    jobType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Remote', 'Internship'],
      default: 'Full-Time',
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Director'],
      default: 'Mid Level',
    },
    location: {
      type: String,
      default: 'Remote / New York, NY',
    },
    requiredSkills: [
      {
        type: String,
        required: true,
      },
    ],
    salaryMin: {
      type: Number,
      default: 90000,
    },
    salaryMax: {
      type: Number,
      default: 140000,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Closed', 'Paused', 'Moderation'],
      default: 'Active',
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    aiGeneratedJd: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
