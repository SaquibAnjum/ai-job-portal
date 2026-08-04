const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      default: 'Passionate Software Engineer',
    },
    bio: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Remote / New York, NY',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeOriginalName: {
      type: String,
      default: '',
    },
    resumeSummary: {
      type: String,
      default: '',
    },
    parsedData: {
      extractedSkills: [String],
      totalExperienceYears: { type: Number, default: 0 },
      parsedAt: Date,
    },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' },
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: String,
        endYear: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
        github: String,
      },
    ],
    certificates: [
      {
        name: String,
        issuer: String,
        issueDate: String,
        credentialUrl: String,
      },
    ],
    languages: [String],
    achievements: [String],
    profilePhotoUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    preferredSalary: { type: String, default: '$100,000 - $140,000' },
    workMode: { type: String, default: 'Remote' },
    careerGoal: { type: String, default: 'Senior Full Stack Software Engineer' },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    resumeVersions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResumeVersion',
      },
    ],
    atsReport: {
      atsScore: { type: Number, default: 0 },
      resumeStrength: { type: String, default: '' },
      weaknesses: [String],
      missingKeywords: [String],
      grammarIssues: [String],
      formattingProblems: [String],
      actionVerbs: [String],
      missingSkills: [String],
      industryKeywords: [String],
      recruiterSuggestions: [String],
      improveSummary: { type: String, default: '' },
      improveProjects: [String],
      improveExperience: [String],
      improveSkills: [String],
      improvedResumeText: { type: String, default: '' },
      generatedAt: Date,
    },
    aiCareerRoadmap: {
      currentLevel: { type: String, default: 'Intermediate Developer' },
      targetLevel: { type: String, default: 'Senior Software Engineer' },
      estimatedTimeline: { type: String, default: '6 - 12 Months' },
      skillGap: [String],
      learningPath: [
        {
          phase: String,
          title: String,
          description: String,
          targetSkills: [String],
          duration: String,
        },
      ],
      weeklyRoadmap: [
        {
          week: String,
          focus: String,
          tasks: [String],
        },
      ],
      monthlyRoadmap: [
        {
          month: String,
          milestone: String,
          objectives: [String],
        },
      ],
      recommendedCourses: [String],
      recommendedCertifications: [String],
      projectsToBuild: [
        {
          title: String,
          description: String,
          techStack: [String],
        },
      ],
      interviewTopics: [String],
      systemDesignTopics: [String],
      dsaTopics: [String],
      softSkills: [String],
      salaryGrowthPrediction: {
        currentAvg: { type: String, default: '$95,000' },
        targetAvg: { type: String, default: '$145,000' },
        growthPercentage: { type: String, default: '+52%' },
      },
      companyRecommendations: [String],
      dailyPracticePlan: [String],
      generatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
