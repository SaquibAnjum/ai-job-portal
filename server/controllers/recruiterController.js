const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');
const { generateOfferPdfStream } = require('../services/pdfService');
const { sendNotificationToUser } = require('../config/socket');
const { logAudit } = require('../middlewares/auditMiddleware');

// @desc    Get Recruiter Profile & Company Details
// @route   GET /api/v1/recruiter/profile
exports.getRecruiterProfile = async (req, res, next) => {
  try {
    let profile = await RecruiterProfile.findOne({ user: req.user.id })
      .populate('user', 'name email avatar phone')
      .populate('company');

    if (!profile) {
      profile = await RecruiterProfile.create({ user: req.user.id });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Recruiter & Company Profile
// @route   PUT /api/v1/recruiter/profile
exports.updateRecruiterProfile = async (req, res, next) => {
  try {
    const { designation, department, workEmail, companyName, companyLogo, website, industry, description, location } = req.body;

    let profile = await RecruiterProfile.findOne({ user: req.user.id });
    if (!profile) profile = new RecruiterProfile({ user: req.user.id });

    if (designation) profile.designation = designation;
    if (department) profile.department = department;
    if (workEmail) profile.workEmail = workEmail;

    let company = await Company.findById(profile.company);
    if (!company) {
      company = new Company({
        name: companyName || `${req.user.name}'s Company`,
        createdRecruiter: req.user.id,
      });
    }

    if (companyName) company.name = companyName;
    if (companyLogo) company.logo = companyLogo;
    if (website) company.website = website;
    if (industry) company.industry = industry;
    if (description) company.description = description;
    if (location) company.location = location;

    await company.save();

    profile.company = company._id;
    await profile.save();

    await logAudit(req.user.id, req.user.email, 'UPDATE_RECRUITER_PROFILE', 'RecruiterProfile', profile._id, {}, req);
    res.status(200).json({ success: true, profile, company });
  } catch (err) {
    next(err);
  }
};

// @desc    Request Company Verification
// @route   POST /api/v1/recruiter/request-verification
exports.requestCompanyVerification = async (req, res, next) => {
  try {
    const profile = await RecruiterProfile.findOne({ user: req.user.id });
    if (!profile || !profile.company) {
      return res.status(400).json({ success: false, message: 'Please create a company profile first' });
    }

    const company = await Company.findById(profile.company);
    company.verificationRequested = true;
    await company.save();

    await logAudit(req.user.id, req.user.email, 'REQUEST_COMPANY_VERIFICATION', 'Company', company._id, {}, req);
    res.status(200).json({ success: true, message: 'Company verification request submitted to Admin', company });
  } catch (err) {
    next(err);
  }
};

// @desc    Get All Jobs posted by current recruiter (including Drafts)
// @route   GET /api/v1/recruiter/my-jobs
exports.getMyPostedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .populate('company', 'name logo isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject Candidate with Feedback Reason
// @route   POST /api/v1/recruiter/applications/:id/reject
exports.rejectCandidate = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const application = await Application.findById(req.params.id).populate('job', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = 'Rejected';
    application.rejectionReason = rejectionReason || 'Qualifications do not match current requirement criteria.';
    await application.save();

    // Alert candidate via WebSockets
    const notif = await Notification.create({
      user: application.candidate,
      title: 'Application Status Update',
      message: `Your application for ${application.job?.title} was rejected. Feedback: ${application.rejectionReason}`,
      type: 'Application',
      link: '/applications',
    });
    sendNotificationToUser(application.candidate, notif);

    await logAudit(req.user.id, req.user.email, 'REJECT_CANDIDATE', 'Application', application._id, { reason: application.rejectionReason }, req);
    res.status(200).json({ success: true, message: 'Candidate rejected with feedback', data: application });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Recruiter Analytics & Hiring Funnel
// @route   GET /api/v1/recruiter/analytics
exports.getRecruiterAnalytics = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id });
    const jobIds = jobs.map((j) => j._id);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'Active').length;
    const draftJobs = jobs.filter((j) => j.status === 'Draft').length;

    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const shortlistedCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'Shortlisted' });
    const interviewingCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'Interviewing' });
    const offeredCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'Offered' });
    const rejectedCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'Rejected' });

    // Aggregate skill demand across recruiter's jobs
    const skillMap = {};
    jobs.forEach((j) => {
      j.requiredSkills.forEach((s) => {
        skillMap[s] = (skillMap[s] || 0) + 1;
      });
    });

    const topRequiredSkills = Object.keys(skillMap)
      .map((k) => ({ skill: k, count: skillMap[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        draftJobs,
        totalApplications,
        topRequiredSkills,
        funnel: {
          submitted: totalApplications,
          shortlisted: shortlistedCount,
          interviewing: interviewingCount,
          offered: offeredCount,
          rejected: rejectedCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Issue Offer Letter to Candidate & Generate PDF Stream
// @route   POST /api/v1/recruiter/issue-offer
exports.issueOfferLetter = async (req, res, next) => {
  try {
    const { applicationId, salary, joiningDate, terms } = req.body;

    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const offer = await Offer.create({
      application: applicationId,
      candidate: application.candidate,
      recruiter: req.user.id,
      company: application.job.company,
      jobTitle: application.job.title,
      salary: salary || 120000,
      joiningDate: joiningDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      terms: terms || 'Standard corporate employment agreement terms.',
      status: 'Pending',
    });

    application.status = 'Offered';
    await application.save();

    const notif = await Notification.create({
      user: application.candidate,
      title: 'Congratulations! Official Job Offer Received',
      message: `You have received an official offer letter for ${application.job.title}!`,
      type: 'Offer',
      link: '/applications',
    });
    sendNotificationToUser(application.candidate, notif);

    await logAudit(req.user.id, req.user.email, 'ISSUE_OFFER', 'Offer', offer._id, { salary, jobTitle: application.job.title }, req);
    res.status(201).json({ success: true, message: 'Offer letter issued successfully!', data: offer });
  } catch (err) {
    next(err);
  }
};

// @desc    Download Offer Letter PDF Stream
// @route   GET /api/v1/recruiter/offer/:offerId/pdf
exports.downloadOfferPdf = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer letter not found' });
    }

    generateOfferPdfStream(offer, res);
  } catch (err) {
    next(err);
  }
};
