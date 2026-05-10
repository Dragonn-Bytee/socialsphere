const Post = require('../models/Post');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');

exports.createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = new Post({
      userId: req.user.id,
      content,
      image
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(req.user.id);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
      
      // Create notification
      if (post.userId.toString() !== req.user.id) {
        const notification = new Notification({
          userId: post.userId,
          fromUserId: req.user.id,
          type: 'like',
          postId: post._id,
          message: `${req.user.username} liked your post`
        });
        await notification.save();
        
        // Emit socket event (handled in server.js or socket helper)
        if (global.io) {
          global.io.to(post.userId.toString()).emit('notification', notification);
        }
      }
    }
    
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = new Comment({
      postId,
      userId: req.user.id,
      text
    });

    await comment.save();

    // Increment post comment count
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    // Create notification for post owner
    if (post.userId.toString() !== req.user.id) {
      const notification = new Notification({
        userId: post.userId,
        fromUserId: req.user.id,
        type: 'comment',
        postId,
        message: `${req.user.username} commented on your post`
      });
      await notification.save();

      if (global.io) {
        global.io.to(post.userId.toString()).emit('notification', notification);
      }
    }

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'username avatar');
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .populate('userId', 'username avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
