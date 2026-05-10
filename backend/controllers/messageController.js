const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const newMessage = new Message({
      senderId: req.user.id,
      receiverId,
      text
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { friendId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: friendId },
        { senderId: friendId, receiverId: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    // This is a bit complex in Mongo, for now let's just get distinct people I've messaged
    const messages = await Message.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
    .populate('senderId', 'username avatar')
    .populate('receiverId', 'username avatar')
    .sort({ createdAt: -1 });

    const conversations = [];
    const seen = new Set();

    messages.forEach(msg => {
      const otherUser = msg.senderId._id.toString() === req.user.id ? msg.receiverId : msg.senderId;
      if (!seen.has(otherUser._id.toString())) {
        seen.add(otherUser._id.toString());
        conversations.push({
          user: otherUser,
          lastMessage: msg.text,
          createdAt: msg.createdAt
        });
      }
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
