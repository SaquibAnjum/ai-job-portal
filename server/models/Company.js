const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150',
    },
    website: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: 'Information Technology & Software',
    },
    companySize: {
      type: String,
      default: '11-50 employees',
    },
    location: {
      type: String,
      default: 'San Francisco, CA / Remote',
    },
    description: {
      type: String,
      default: 'Innovating AI and Cloud technologies for enterprise applications.',
    },
    foundedYear: {
      type: Number,
      default: 2021,
    },
    createdRecruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
    },
    hrContact: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    verificationDocuments: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationRequested: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
