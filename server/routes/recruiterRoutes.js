const express = require('express');
const {
  getRecruiterProfile,
  updateRecruiterProfile,
  requestCompanyVerification,
  getMyPostedJobs,
  rejectCandidate,
  getRecruiterAnalytics,
  issueOfferLetter,
  downloadOfferPdf,
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/profile', protect, authorize('recruiter', 'admin'), getRecruiterProfile);
router.put('/profile', protect, authorize('recruiter', 'admin'), updateRecruiterProfile);
router.post('/request-verification', protect, authorize('recruiter', 'admin'), requestCompanyVerification);
router.get('/my-jobs', protect, authorize('recruiter', 'admin'), getMyPostedJobs);
router.post('/applications/:id/reject', protect, authorize('recruiter', 'admin'), rejectCandidate);
router.get('/analytics', protect, authorize('recruiter', 'admin'), getRecruiterAnalytics);
router.post('/issue-offer', protect, authorize('recruiter', 'admin'), issueOfferLetter);
router.get('/offer/:offerId/pdf', protect, downloadOfferPdf);

module.exports = router;
