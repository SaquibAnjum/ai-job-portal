const Job = require('../models/Job');
const Company = require('../models/Company');
const RecruiterProfile = require('../models/RecruiterProfile');
const { generateJobDescriptionWithGemini } = require('../services/aiService');
const { logAudit } = require('../middlewares/auditMiddleware');

// @desc    Get all jobs with filtering, workMode, company, skills, sorting, pagination, and search
// @route   GET /api/v1/jobs
exports.getJobs = async (req, res, next) => {
  try {
    const { keyword, location, jobType, workMode, experienceLevel, companyId, salaryMin, page = 1, limit = 10 } = req.query;

    const query = { status: 'Active' };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(keyword, 'i')] } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (workMode) {
      query.workMode = workMode;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (companyId) {
      query.company = companyId;
    }

    if (salaryMin) {
      query.salaryMin = { $gte: Number(salaryMin) };
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name logo website industry location isVerified')
      .populate('recruiter', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/v1/jobs/:id
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('recruiter', 'name email avatar');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new job (Recruiter only - supports Draft or Active)
// @route   POST /api/v1/jobs
exports.createJob = async (req, res, next) => {
  try {
    const recruiterProfile = await RecruiterProfile.findOne({ user: req.user.id });
    let companyId = recruiterProfile?.company;

    if (!companyId) {
      const newCompany = await Company.create({
        name: req.body.companyName || `${req.user.name}'s Hiring Team`,
        createdRecruiter: req.user.id,
      });
      companyId = newCompany._id;
      if (recruiterProfile) {
        recruiterProfile.company = companyId;
        await recruiterProfile.save();
      }
    }

    const job = await Job.create({
      ...req.body,
      company: companyId,
      recruiter: req.user.id,
      status: req.body.status || 'Active',
    });

    await logAudit(req.user.id, req.user.email, 'CREATE_JOB', 'Job', job._id, { title: job.title, status: job.status }, req);
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Update job (Recruiter/Admin)
// @route   PUT /api/v1/jobs/:id
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Publish / Unpublish / Draft Status
// @route   PUT /api/v1/jobs/:id/status
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    job.status = status;
    await job.save();

    await logAudit(req.user.id, req.user.email, 'UPDATE_JOB_STATUS', 'Job', job._id, { status }, req);
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete job (Recruiter/Admin)
// @route   DELETE /api/v1/jobs/:id
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    await logAudit(req.user.id, req.user.email, 'DELETE_JOB', 'Job', req.params.id, {}, req);
    res.status(200).json({ success: true, message: 'Job posting deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate AI Job Description using Gemini
// @route   POST /api/v1/jobs/generate-jd
exports.generateAIJd = async (req, res, next) => {
  try {
    const { role, skills, experienceLevel } = req.body;
    if (!role || !skills) {
      return res.status(400).json({ success: false, message: 'Role and skills are required' });
    }

    const description = await generateJobDescriptionWithGemini(role, skills, experienceLevel || 'Mid Level');
    res.status(200).json({ success: true, description });
  } catch (err) {
    next(err);
  }
};
