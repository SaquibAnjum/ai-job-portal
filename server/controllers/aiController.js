const {
  parseResumeWithGemini,
  calculateJobMatchWithGemini,
  generateJobDescriptionWithGemini,
  generateInterviewQuestionsWithGemini,
  generateResumeSummaryWithGemini,
  improveResumeWithGemini,
  generateCareerRoadmapWithGemini,
  generateCoverLetterWithGemini,
  askAiAssistantWithGemini,
  rankApplicantsWithAI,
  generateTextEmbedding,
  cosineSimilarity,
  recruiterCopilotWithGemini,
  compareCandidatesWithGemini,
  suggestSalaryBenchmarkWithGemini,
  suggestSkillsForJobWithGemini,
} = require('../services/aiService');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Parse raw text or resume text
// @route   POST /api/v1/ai/parse-resume-text
exports.parseResumeText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide resume text to parse' });
    }
    const result = await parseResumeWithGemini(text);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Match Candidate Skills against Job Skills
// @route   POST /api/v1/ai/match-job
exports.matchJobSkills = async (req, res, next) => {
  try {
    const { candidateSkills, candidateExp, jobTitle, jobSkills, jobDescription } = req.body;
    const match = await calculateJobMatchWithGemini(
      candidateSkills || [],
      candidateExp || 2,
      jobTitle || 'Role',
      jobSkills || [],
      jobDescription || ''
    );
    res.status(200).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate Interview Questions Bank
// @route   POST /api/v1/ai/generate-questions
exports.generateQuestions = async (req, res, next) => {
  try {
    const { jobRole, experienceLevel, candidateSkills, difficulty } = req.body;
    const questions = await generateInterviewQuestionsWithGemini(
      jobRole || 'Software Developer',
      experienceLevel || 'Mid Level',
      candidateSkills || [],
      difficulty || 'Intermediate'
    );
    res.status(200).json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
};

// @desc    Ask AI Chatbot Assistant with conversation memory & context
// @route   POST /api/v1/ai/chat
exports.chatWithAssistant = async (req, res, next) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    let userContext = {};
    if (req.user) {
      const profile = await CandidateProfile.findOne({ user: req.user.id });
      userContext = {
        name: req.user.name,
        email: req.user.email,
        headline: profile?.headline,
        skills: profile?.skills,
        bio: profile?.bio,
      };
    }

    const response = await askAiAssistantWithGemini(prompt, history || [], userContext);
    res.status(200).json({ success: true, response });
  } catch (err) {
    console.error('[AI Chat Assistant Error]:', err);
    res.status(200).json({
      success: true,
      response: "Hello! I am your NexHire AI Assistant. I can help with resume tips, ATS scoring, career roadmaps, and interview preparation. What would you like to explore?",
    });
  }
};

// @desc    Generate AI Resume Summary
// @route   POST /api/v1/ai/resume-summary
exports.generateResumeSummary = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }
    const summary = await generateResumeSummaryWithGemini(profile);
    profile.resumeSummary = summary;
    await profile.save();
    res.status(200).json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate AI Resume Improvement & ATS Optimizer Report
// @route   POST /api/v1/ai/resume-improve
exports.improveResume = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user.id });
    }
    const feedback = await improveResumeWithGemini(profile, targetRole || profile.headline);

    profile.atsReport = {
      ...feedback,
      generatedAt: new Date(),
    };
    await profile.save();

    res.status(200).json({ success: true, data: feedback, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate AI Cover Letter
// @route   POST /api/v1/ai/cover-letter
exports.generateCoverLetter = async (req, res, next) => {
  try {
    const { jobTitle, companyName } = req.body;
    const profile = await CandidateProfile.findOne({ user: req.user.id }).populate('user', 'name');
    const candidateName = profile?.user?.name || req.user.name;
    const candSkills = profile?.skills?.map((s) => (typeof s === 'string' ? s : s.name)) || [];

    const coverLetter = await generateCoverLetterWithGemini(candidateName, jobTitle || 'Software Role', companyName || 'Tech Company', candSkills);
    res.status(200).json({ success: true, coverLetter });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate AI Career Roadmap
// @route   POST /api/v1/ai/career-roadmap
exports.generateCareerRoadmap = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user.id });
    }
    const currentSkills = profile?.skills?.map((s) => (typeof s === 'string' ? s : s.name)) || [];

    const roadmap = await generateCareerRoadmapWithGemini(targetRole || profile?.headline || 'Senior Software Engineer', currentSkills, profile);
    
    if (profile) {
      profile.aiCareerRoadmap = {
        ...roadmap,
        generatedAt: new Date(),
      };
      await profile.save();
    }
    res.status(200).json({ success: true, data: roadmap, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Rank Applicants for a Job (Recruiter AI Ranking)
// @route   GET /api/v1/ai/rank-applicants/:jobId
exports.rankJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applicants = await Application.find({ job: jobId })
      .populate({
        path: 'candidate',
        select: 'name email avatar phone',
        populate: { path: 'candidateProfile' },
      });

    const ranked = await rankApplicantsWithAI(job, applicants);
    res.status(200).json({ success: true, count: ranked.length, data: ranked });
  } catch (err) {
    next(err);
  }
};

// @desc    Natural Language Semantic Vector Search over Candidates
// @route   GET /api/v1/ai/semantic-candidate-search
exports.semanticCandidateSearch = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query parameter is required' });
    }

    const queryEmbedding = await generateTextEmbedding(query);

    const candidates = await CandidateProfile.find().populate('user', 'name email avatar phone');

    const ranked = await Promise.all(
      candidates.map(async (cand) => {
        const candSkills = cand.skills?.map((s) => (typeof s === 'string' ? s : s.name)) || [];
        const textToEmbed = `${cand.headline} ${cand.bio} ${candSkills.join(' ')}`.toLowerCase();
        const candEmbedding = await generateTextEmbedding(textToEmbed);

        const similarity = cosineSimilarity(queryEmbedding, candEmbedding);
        const matchScore = Math.round(similarity * 100);

        return {
          ...cand.toObject(),
          matchScore: Math.max(matchScore, 40),
        };
      })
    );

    ranked.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, count: ranked.length, data: ranked });
  } catch (err) {
    next(err);
  }
};

// @desc    Natural Language Semantic Vector Search over Jobs
// @route   GET /api/v1/ai/semantic-job-search
exports.semanticJobSearch = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query parameter is required' });
    }

    const queryEmbedding = await generateTextEmbedding(query);
    const jobs = await Job.find({ status: 'Active' }).populate('company', 'name logo location');

    const ranked = await Promise.all(
      jobs.map(async (job) => {
        const textToEmbed = `${job.title} ${job.requiredSkills.join(' ')} ${job.description}`.toLowerCase();
        const jobEmbedding = await generateTextEmbedding(textToEmbed);

        const similarity = cosineSimilarity(queryEmbedding, jobEmbedding);
        const matchScore = Math.round(similarity * 100);

        return {
          ...job.toObject(),
          matchScore: Math.max(matchScore, 45),
        };
      })
    );

    ranked.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, count: ranked.length, data: ranked });
  } catch (err) {
    next(err);
  }
};

// @desc    Recruiter AI Assistant Copilot Chat
// @route   POST /api/v1/ai/recruiter-copilot
exports.recruiterCopilot = async (req, res, next) => {
  try {
    const { prompt, history, candidates, jobs } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const RecruiterProfile = require('../models/RecruiterProfile');
    const profile = await RecruiterProfile.findOne({ user: req.user.id }).populate('company');
    const recruiterContext = {
      name: req.user.name,
      companyName: profile?.company?.name || 'NexHire Partner',
    };

    const reply = await recruiterCopilotWithGemini(prompt, history, recruiterContext, candidates || [], jobs || []);
    res.status(200).json({ success: true, response: reply });
  } catch (err) {
    next(err);
  }
};

// @desc    Compare Candidates Side-by-side
// @route   POST /api/v1/ai/compare-candidates
exports.compareCandidates = async (req, res, next) => {
  try {
    const { candidateA, candidateB, job } = req.body;
    const comparison = await compareCandidatesWithGemini(candidateA || {}, candidateB || {}, job || {});
    res.status(200).json({ success: true, data: comparison });
  } catch (err) {
    next(err);
  }
};

// @desc    Suggest Salary Benchmark
// @route   POST /api/v1/ai/salary-benchmark
exports.suggestSalaryBenchmark = async (req, res, next) => {
  try {
    const { role, skills, location } = req.body;
    const benchmark = await suggestSalaryBenchmarkWithGemini(role || 'Software Engineer', skills || [], location || 'Remote');
    res.status(200).json({ success: true, data: benchmark });
  } catch (err) {
    next(err);
  }
};

// @desc    Suggest Skills for Job
// @route   POST /api/v1/ai/suggest-skills
exports.suggestSkills = async (req, res, next) => {
  try {
    const { role } = req.body;
    const skills = await suggestSkillsForJobWithGemini(role || 'Full Stack Engineer');
    res.status(200).json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
};
