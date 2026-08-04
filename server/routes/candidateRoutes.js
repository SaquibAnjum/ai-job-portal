const express = require('express');
const {
  getCandidateProfile,
  updateCandidateProfile,
  uploadProfilePhoto,
  uploadResumeAndParse,
  getResumeVersions,
  setActiveResumeVersion,
  withdrawApplication,
  toggleSaveJob,
  getRecommendationsAndSkillGap,
} = require('../controllers/candidateController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/profile', protect, getCandidateProfile);
router.put('/profile', protect, updateCandidateProfile);
router.post('/upload-photo', protect, upload.single('photo'), uploadProfilePhoto);
router.post('/upload-resume', protect, upload.single('resume'), uploadResumeAndParse);
router.get('/resumes/versions', protect, getResumeVersions);
router.put('/resumes/versions/:id/activate', protect, setActiveResumeVersion);
router.post('/applications/:id/withdraw', protect, withdrawApplication);
router.post('/save-job/:jobId', protect, toggleSaveJob);
router.get('/recommendations', protect, getRecommendationsAndSkillGap);

module.exports = router;
