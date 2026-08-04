const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const AuditLog = require('../models/AuditLog');
const Subscription = require('../models/Subscription');
const { logAudit } = require('../middlewares/auditMiddleware');

// @desc    Get Platform Administration Dashboard Overview Stats
// @route   GET /api/v1/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'Active' });
    const draftJobs = await Job.countDocuments({ status: 'Draft' });
    const totalApplications = await Application.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const verifiedCompanies = await Company.countDocuments({ isVerified: true });
    const pendingVerifications = await Company.countDocuments({ verificationRequested: true, isVerified: false });

    // Application Status breakdown
    const appStats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalJobs,
        activeJobs,
        draftJobs,
        totalApplications,
        totalCompanies,
        verifiedCompanies,
        pendingVerifications,
        appStats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get All System Users
// @route   GET /api/v1/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or Toggle User Status
// @route   DELETE /api/v1/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    await logAudit(req.user.id, req.user.email, 'ADMIN_DELETE_USER', 'User', req.params.id, {}, req);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Companies Pending Verification
// @route   GET /api/v1/admin/companies/pending
exports.getPendingCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate('createdRecruiter', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Company Verification Status
// @route   PUT /api/v1/admin/companies/:id/verify
exports.verifyCompany = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    company.isVerified = isVerified;
    company.verificationRequested = false;
    if (isVerified) company.verifiedAt = new Date();
    await company.save();

    await logAudit(req.user.id, req.user.email, 'VERIFY_COMPANY', 'Company', company._id, { isVerified }, req);
    res.status(200).json({ success: true, message: `Company verification set to ${isVerified}`, data: company });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate Job Posting (Approve, Flag, Change Status)
// @route   PUT /api/v1/admin/jobs/:id/moderate
exports.moderateJob = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    job.status = status || 'Active';
    await job.save();

    await logAudit(req.user.id, req.user.email, 'MODERATE_JOB', 'Job', job._id, { status: job.status }, req);
    res.status(200).json({ success: true, message: `Job status updated to ${job.status}`, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Audit Logs
// @route   GET /api/v1/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get All User Subscriptions
// @route   GET /api/v1/admin/subscriptions
exports.getSubscriptions = async (req, res, next) => {
  try {
    const subs = await Subscription.find().populate('user', 'name email role').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: subs.length, data: subs });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Subscription Plan / Credits
// @route   PUT /api/v1/admin/subscriptions/:id
exports.updateSubscription = async (req, res, next) => {
  try {
    const { plan, aiCredits, status } = req.body;
    const sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription record not found' });
    }

    if (plan) sub.plan = plan;
    if (aiCredits !== undefined) sub.aiCredits = aiCredits;
    if (status) sub.status = status;

    await sub.save();

    await logAudit(req.user.id, req.user.email, 'UPDATE_SUBSCRIPTION', 'Subscription', sub._id, { plan, aiCredits }, req);
    res.status(200).json({ success: true, data: sub });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Detailed System Analytics Reports
// @route   GET /api/v1/admin/reports
exports.getReports = async (req, res, next) => {
  try {
    // 1. Hiring conversion funnel
    const totalApps = await Application.countDocuments();
    const shortlistedApps = await Application.countDocuments({ status: 'Shortlisted' });
    const interviewedApps = await Application.countDocuments({ status: 'Interviewing' });
    const offeredApps = await Application.countDocuments({ status: 'Offered' });

    // 2. Average Match Score across platform
    const matchAgg = await Application.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$aiMatchAnalysis.matchScore' } } },
    ]);
    const avgMatchScore = matchAgg[0] ? Math.round(matchAgg[0].avgScore) : 78;

    // 3. User distribution
    const candidatesCount = await User.countDocuments({ role: 'candidate' });
    const recruitersCount = await User.countDocuments({ role: 'recruiter' });

    res.status(200).json({
      success: true,
      data: {
        funnel: {
          total: totalApps,
          shortlisted: shortlistedApps,
          interviewed: interviewedApps,
          offered: offeredApps,
        },
        avgMatchScore,
        userBreakdown: {
          candidates: candidatesCount,
          recruiters: recruitersCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
