const express = require('express');
const { getMessagesWithUser, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:otherUserId', protect, getMessagesWithUser);
router.post('/', protect, sendMessage);

module.exports = router;
