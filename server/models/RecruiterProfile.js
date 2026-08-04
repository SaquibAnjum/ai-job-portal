const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    designation: {
      type: String,
      default: 'Senior Talent Acquisition Manager',
    },
    department: {
      type: String,
      default: 'Human Resources',
    },
    workEmail: {
      type: String,
      default: '',
    },
    isCompanyVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
