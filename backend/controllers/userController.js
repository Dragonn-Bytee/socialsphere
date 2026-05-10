const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      // Create notification
      const notification = new Notification({
        userId: userToFollow._id,
        fromUserId: currentUser._id,
        type: 'follow',
        message: `${currentUser.username} started following you`
      });
      await notification.save();

      if (global.io) {
        global.io.to(userToFollow._id.toString()).emit('notification', notification);
      }
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: isFollowing ? 'Unfollowed' : 'Followed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    }).select('username avatar bio').limit(10);
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
