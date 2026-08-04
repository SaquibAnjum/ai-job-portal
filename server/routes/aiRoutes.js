const express = require('express');
const {
  parseResumeText,
  matchJobSkills,
  generateQuestions,
  chatWithAssistant,
  generateResumeSummary,
  improveResume,
  generateCoverLetter,
  generateCareerRoadmap,
  rankJobApplicants,
  semanticCandidateSearch,
  semanticJobSearch,
} = require('../controllers/aiController');
const { protect, optionalProtect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/parse-resume-text', protect, parseResumeText);
router.post('/match-job', protect, matchJobSkills);
router.post('/generate-questions', protect, generateQuestions);
router.post('/chat', optionalProtect, chatWithAssistant);
router.post('/resume-summary', protect, generateResumeSummary);
router.post('/resume-improve', protect, improveResume);
router.post('/cover-letter', protect, generateCoverLetter);
router.post('/career-roadmap', protect, generateCareerRoadmap);

router.get('/rank-applicants/:jobId', protect, authorize('recruiter', 'admin'), rankJobApplicants);
router.get('/semantic-candidate-search', protect, authorize('recruiter', 'admin'), semanticCandidateSearch);
router.get('/semantic-job-search', protect, semanticJobSearch);

module.exports = router;
