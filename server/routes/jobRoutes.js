const express = require('express');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  generateAIJd,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/generate-jd', protect, authorize('recruiter', 'admin'), generateAIJd);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateJobStatus);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
