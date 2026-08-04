const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const Notification = require('../models/Notification');
const { calculateJobMatchWithGemini } = require('../services/aiService');
const { sendNotificationToUser } = require('../config/socket');

// @desc    Apply for job & compute AI Match Score
// @route   POST /api/v1/applications
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const candidateProfile = await CandidateProfile.findOne({ user: req.user.id });
    if (!candidateProfile || !candidateProfile.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume to your profile before applying!',
      });
    }

    const existingApp = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this position' });
    }

    // Run AI Match Score analysis via Gemini API
    const candSkills = candidateProfile.skills?.map((s) => s.name) || [];
    const aiAnalysis = await calculateJobMatchWithGemini(
      candSkills,
      candidateProfile.parsedData?.totalExperienceYears || 3,
      job.title,
      job.requiredSkills,
      job.description
    );

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      resumeUrl: candidateProfile.resumeUrl,
      coverLetter: coverLetter || '',
      status: 'Submitted',
      aiMatchAnalysis: {
        ...aiAnalysis,
        analyzedAt: new Date(),
      },
    });

    // Increment application count on job
    job.applicationsCount += 1;
    await job.save();

    // Send Real-Time Socket Notification to Recruiter
    const notif = await Notification.create({
      user: job.recruiter,
      title: 'New Candidate Application!',
      message: `${req.user.name} applied for ${job.title} (Match Score: ${aiAnalysis.matchScore}%)`,
      type: 'Application',
      link: `/applications`,
    });
    sendNotificationToUser(job.recruiter, notif);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully with AI Match analysis!',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate's submitted applications
// @route   GET /api/v1/applications/my-applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Get applications for recruiter's job posts (Ranked by AI Score)
// @route   GET /api/v1/applications/job/:jobId
exports.getJobApplicationsRanked = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, minScore } = req.query;

    const query = { job: jobId };
    if (status) query.status = status;
    if (minScore) query['aiMatchAnalysis.matchScore'] = { $gte: Number(minScore) };

    const applications = await Application.find(query)
      .populate('candidate', 'name email avatar phone')
      .populate({
        path: 'candidate',
        populate: { path: 'candidateProfile', select: 'headline skills resumeUrl' },
      })
      .sort({ 'aiMatchAnalysis.matchScore': -1, createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (Shortlist, Reject, Interviewing, Offered)
// @route   PUT /api/v1/applications/:id/status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, recruiterNotes } = req.body;

    let application = await Application.findById(req.params.id).populate('job', 'title');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status) application.status = status;
    if (recruiterNotes) application.recruiterNotes = recruiterNotes;

    await application.save();

    // Send real-time notification to candidate
    const notif = await Notification.create({
      user: application.candidate,
      title: `Application Status Updated: ${status}`,
      message: `Your application for ${application.job.title} status has been updated to "${status}".`,
      type: 'Application',
      link: '/applications',
    });
    sendNotificationToUser(application.candidate, notif);

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};
