const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { generateInterviewQuestionsWithGemini } = require('../services/aiService');
const { sendNotificationToUser } = require('../config/socket');

// @desc    Schedule Interview & generate AI questions
// @route   POST /api/v1/interviews
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, scheduledAt, type, meetingLink, durationMinutes } = req.body;

    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Generate AI Questions for interview preparation
    const aiQuestions = await generateInterviewQuestionsWithGemini(
      application.job?.title || 'Engineer',
      application.job?.experienceLevel || 'Mid Level',
      application.aiMatchAnalysis?.matchedSkills || []
    );

    const interview = await Interview.create({
      application: applicationId,
      candidate: application.candidate,
      recruiter: req.user.id,
      scheduledAt: scheduledAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
      type: type || 'Technical',
      meetingLink: meetingLink || 'https://meet.google.com/ai-recruitment-call',
      durationMinutes: durationMinutes || 45,
      aiGeneratedQuestions: aiQuestions,
      status: 'Scheduled',
    });

    application.status = 'Interviewing';
    await application.save();

    // Alert candidate via WebSockets
    const notif = await Notification.create({
      user: application.candidate,
      title: 'Interview Invitation Received!',
      message: `You have been invited for a ${type || 'Technical'} Interview for ${application.job?.title}.`,
      type: 'Interview',
      link: '/interviews',
    });
    sendNotificationToUser(application.candidate, notif);

    res.status(201).json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Candidate or Recruiter Interviews
// @route   GET /api/v1/interviews/my-interviews
exports.getMyInterviews = async (req, res, next) => {
  try {
    const query = req.user.role === 'candidate'
      ? { candidate: req.user.id }
      : { recruiter: req.user.id };

    const interviews = await Interview.find(query)
      .populate('candidate', 'name email avatar phone')
      .populate('recruiter', 'name email avatar')
      .populate({
        path: 'application',
        populate: { path: 'job', populate: { path: 'company', select: 'name logo' } },
      })
      .sort({ scheduledAt: 1 });

    res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (err) {
    next(err);
  }
};
