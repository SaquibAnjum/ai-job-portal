const express = require('express');
const { scheduleInterview, getMyInterviews } = require('../controllers/interviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, scheduleInterview);
router.get('/my-interviews', protect, getMyInterviews);

module.exports = router;
