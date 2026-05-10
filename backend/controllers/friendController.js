const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// Send Friend Request
exports.sendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user.id;

    if (receiverId === senderId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if they are already friends
    const user = await User.findById(senderId);
    if (user.friends.includes(receiverId)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A friend request is already pending or has been handled" });
    }

    const newRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    await newRequest.save();
    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept Friend Request
exports.acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const userId = req.user.id;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to accept this request" });
    }

    // Update status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add each other to friends lists
    await User.findByIdAndUpdate(friendRequest.sender, { $addToSet: { friends: friendRequest.receiver } });
    await User.findByIdAndUpdate(friendRequest.receiver, { $addToSet: { friends: friendRequest.sender } });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Decline Friend Request
exports.declineRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const userId = req.user.id;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to decline this request" });
    }

    // We can either delete it or set status to rejected
    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ receiver: req.user.id, status: 'pending' })
      .populate('sender', 'username avatar');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Friends List
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username avatar bio');
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
