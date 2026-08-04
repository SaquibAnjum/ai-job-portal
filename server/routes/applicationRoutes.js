const express = require('express');
const {
  applyForJob,
  getMyApplications,
  getJobApplicationsRanked,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('candidate'), applyForJob);
router.get('/my-applications', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicationsRanked);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
