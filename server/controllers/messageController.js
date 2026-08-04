const Message = require('../models/Message');

// @desc    Get user's chat messages with specific recipient
// @route   GET /api/v1/messages/:otherUserId
exports.getMessagesWithUser = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Send direct message
// @route   POST /api/v1/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, applicationId } = req.body;

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      application: applicationId || null,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};
