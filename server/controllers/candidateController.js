const CandidateProfile = require('../models/CandidateProfile');
const ResumeVersion = require('../models/ResumeVersion');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { parseResumeWithGemini, generateResumeSummaryWithGemini } = require('../services/aiService');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { logAudit } = require('../middlewares/auditMiddleware');

// @desc    Get current candidate profile
// @route   GET /api/v1/candidate/profile
exports.getCandidateProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user.id })
      .populate('user', 'name email avatar phone isVerified')
      .populate('savedJobs')
      .populate('resumeVersions');

    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user.id });
      profile = await CandidateProfile.findById(profile._id).populate('user', 'name email avatar phone isVerified');
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Update candidate profile details
// @route   PUT /api/v1/candidate/profile
exports.updateCandidateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      headline,
      bio,
      location,
      skills,
      experience,
      education,
      projects,
      certificates,
      achievements,
      languages,
      socialLinks,
      profilePhotoUrl,
      preferredSalary,
      workMode,
      careerGoal,
    } = req.body;

    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user.id });
    }

    // Update User model fields if provided
    const userToUpdate = await User.findById(req.user.id);
    if (userToUpdate) {
      if (name) userToUpdate.name = name;
      if (phone) userToUpdate.phone = phone;
      if (profilePhotoUrl) userToUpdate.avatar = profilePhotoUrl;
      await userToUpdate.save();
    }

    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (phone !== undefined) profile.phone = phone;
    if (profilePhotoUrl !== undefined) profile.profilePhotoUrl = profilePhotoUrl;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (education !== undefined) profile.education = education;
    if (projects !== undefined) profile.projects = projects;
    if (certificates !== undefined) profile.certificates = certificates;
    if (achievements !== undefined) profile.achievements = achievements;
    if (languages !== undefined) profile.languages = languages;
    if (socialLinks !== undefined) profile.socialLinks = socialLinks;
    if (preferredSalary !== undefined) profile.preferredSalary = preferredSalary;
    if (workMode !== undefined) profile.workMode = workMode;
    if (careerGoal !== undefined) profile.careerGoal = careerGoal;

    await profile.save();

    const updatedProfile = await CandidateProfile.findOne({ user: req.user.id })
      .populate('user', 'name email avatar phone isVerified')
      .populate('savedJobs')
      .populate('resumeVersions');

    await logAudit(req.user.id, req.user.email, 'UPDATE_CANDIDATE_PROFILE', 'CandidateProfile', profile._id, {}, req);
    res.status(200).json({ success: true, data: updatedProfile });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload Profile Photo to Cloudinary
// @route   POST /api/v1/candidate/upload-photo
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    const cloudRes = await uploadToCloudinary(req.file.path, 'profile_photos');
    const photoUrl = cloudRes.url;

    await User.findByIdAndUpdate(req.user.id, { avatar: photoUrl });

    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (profile) {
      profile.profilePhotoUrl = photoUrl;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully to Cloudinary',
      photoUrl,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload Resume (PDF/DOCX), upload to Cloudinary, parse with AI & save ResumeVersion
// @route   POST /api/v1/candidate/upload-resume
exports.uploadResumeAndParse = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a resume file to upload' });
    }

    const filePath = req.file.path;
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const parsedPdf = await pdfParse(dataBuffer);
        extractedText = parsedPdf.text;
      } catch (e) {
        console.log('[PDF Parse Warning]: Falling back to UTF-8 file reading');
        extractedText = fs.readFileSync(filePath, 'utf-8');
      }
    } else {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    // Upload file to Cloudinary
    const cloudRes = await uploadToCloudinary(filePath, 'resumes');
    const fileUrl = cloudRes.url;

    // Call Gemini AI Resume Parser Service
    const parsedData = await parseResumeWithGemini(extractedText);

    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user.id });
    }

    // Get current version count for version history
    const existingVersions = await ResumeVersion.countDocuments({ candidate: req.user.id });
    const versionNumber = existingVersions + 1;

    // Create ResumeVersion document
    const resumeVersionDoc = await ResumeVersion.create({
      candidate: req.user.id,
      versionNumber,
      resumeUrl: fileUrl,
      originalName: req.file.originalname,
      fileSize: req.file.size || 0,
      parsedData: {
        extractedSkills: parsedData.skills || [],
        totalExperienceYears: parsedData.totalExperienceYears || 2,
        parsedAt: new Date(),
      },
      summary: parsedData.headline || 'Resume upload version',
      isActive: true,
    });

    // Mark existing versions inactive
    await ResumeVersion.updateMany(
      { candidate: req.user.id, _id: { $ne: resumeVersionDoc._id } },
      { isActive: false }
    );

    profile.resumeUrl = fileUrl;
    profile.resumeOriginalName = req.file.originalname;
    profile.resumeVersions.push(resumeVersionDoc._id);

    if (parsedData) {
      if (parsedData.headline) profile.headline = parsedData.headline;
      if (parsedData.bio) profile.bio = parsedData.bio;
      if (parsedData.phone) profile.phone = parsedData.phone;
      if (parsedData.location) profile.location = parsedData.location;

      if (parsedData.skills && Array.isArray(parsedData.skills)) {
        profile.skills = parsedData.skills.map((skillName) => ({
          name: typeof skillName === 'string' ? skillName : skillName.name,
          level: 'Intermediate',
        }));
      }
      if (parsedData.experience && parsedData.experience.length > 0) profile.experience = parsedData.experience;
      if (parsedData.education && parsedData.education.length > 0) profile.education = parsedData.education;
      if (parsedData.projects && parsedData.projects.length > 0) profile.projects = parsedData.projects;
      if (parsedData.certificates && parsedData.certificates.length > 0) profile.certificates = parsedData.certificates;
      if (parsedData.achievements && parsedData.achievements.length > 0) profile.achievements = parsedData.achievements;
      if (parsedData.languages && parsedData.languages.length > 0) profile.languages = parsedData.languages;
      if (parsedData.socialLinks) profile.socialLinks = { ...profile.socialLinks, ...parsedData.socialLinks };

      profile.parsedData = {
        extractedSkills: parsedData.skills || [],
        totalExperienceYears: parsedData.totalExperienceYears || 2,
        parsedAt: new Date(),
      };
    }

    // Auto-generate AI Executive Summary
    const autoSummary = await generateResumeSummaryWithGemini(profile);
    profile.resumeSummary = autoSummary;

    await profile.save();

    const fullUpdatedProfile = await CandidateProfile.findOne({ user: req.user.id })
      .populate('user', 'name email avatar phone isVerified')
      .populate('savedJobs')
      .populate('resumeVersions');

    await logAudit(req.user.id, req.user.email, 'UPLOAD_RESUME', 'ResumeVersion', resumeVersionDoc._id, { versionNumber }, req);

    res.status(200).json({
      success: true,
      message: `Resume v${versionNumber} uploaded to Cloudinary & auto-parsed by Gemini AI!`,
      parsedData,
      profile: fullUpdatedProfile,
      resumeVersion: resumeVersionDoc,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Candidate's Resume Version History
// @route   GET /api/v1/candidate/resumes/versions
exports.getResumeVersions = async (req, res, next) => {
  try {
    const versions = await ResumeVersion.find({ candidate: req.user.id }).sort({ versionNumber: -1 });
    res.status(200).json({ success: true, count: versions.length, data: versions });
  } catch (err) {
    next(err);
  }
};

// @desc    Set Active Resume Version
// @route   PUT /api/v1/candidate/resumes/versions/:id/activate
exports.setActiveResumeVersion = async (req, res, next) => {
  try {
    const targetVersion = await ResumeVersion.findById(req.params.id);
    if (!targetVersion || targetVersion.candidate.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Resume version not found' });
    }

    await ResumeVersion.updateMany({ candidate: req.user.id }, { isActive: false });
    targetVersion.isActive = true;
    await targetVersion.save();

    const profile = await CandidateProfile.findOne({ user: req.user.id });
    if (profile) {
      profile.resumeUrl = targetVersion.resumeUrl;
      profile.resumeOriginalName = targetVersion.originalName;
      await profile.save();
    }

    res.status(200).json({ success: true, message: `Activated Resume v${targetVersion.versionNumber}`, data: targetVersion });
  } catch (err) {
    next(err);
  }
};

// @desc    Withdraw Application
// @route   POST /api/v1/candidate/applications/:id/withdraw
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to withdraw this application' });
    }

    application.status = 'Rejected';
    application.rejectionReason = 'Withdrawn by candidate';
    await application.save();

    const job = await Job.findById(application.job);
    if (job && job.applicationsCount > 0) {
      job.applicationsCount -= 1;
      await job.save();
    }

    await logAudit(req.user.id, req.user.email, 'WITHDRAW_APPLICATION', 'Application', application._id, {}, req);
    res.status(200).json({ success: true, message: 'Application withdrawn successfully', data: application });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Save/Bookmark Job
// @route   POST /api/v1/candidate/save-job/:jobId
exports.toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user.id });
    }

    const index = profile.savedJobs.indexOf(jobId);
    let isSaved = false;

    if (index > -1) {
      profile.savedJobs.splice(index, 1);
    } else {
      profile.savedJobs.push(jobId);
      isSaved = true;
    }

    await profile.save();
    res.status(200).json({ success: true, isSaved, savedJobs: profile.savedJobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI Recommended Jobs & Skill Gap Report
// @route   GET /api/v1/candidate/recommendations
exports.getRecommendationsAndSkillGap = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    const candSkills = profile?.skills?.map((s) => (typeof s === 'string' ? s : s.name)) || ['React', 'JavaScript'];

    const activeJobs = await Job.find({ status: 'Active' })
      .populate('company', 'name logo location')
      .limit(10);

    const recommendedJobs = activeJobs.map((job) => {
      const lowerCand = candSkills.map((s) => s.toLowerCase());
      const matched = job.requiredSkills.filter((s) => lowerCand.includes(s.toLowerCase()));
      const score = Math.round((matched.length / (job.requiredSkills.length || 1)) * 100);

      return {
        ...job.toObject(),
        matchScore: Math.max(score, 65),
        matchedSkills: matched,
        missingSkills: job.requiredSkills.filter((s) => !lowerCand.includes(s.toLowerCase())),
      };
    });

    res.status(200).json({
      success: true,
      data: recommendedJobs.sort((a, b) => b.matchScore - a.matchScore),
    });
  } catch (err) {
    next(err);
  }
};
