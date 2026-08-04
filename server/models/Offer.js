const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    terms: {
      type: String,
      default: 'Standard employment agreement terms.',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Expired'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
