const Story = require('../models/Story');

exports.createStory = async (req, res) => {
  try {
    const { media, type } = req.body;
    const newStory = new Story({
      userId: req.user.id,
      media,
      type
    });
    await newStory.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStoriesFeed = async (req, res) => {
  try {
    // In a real app, you'd fetch stories from people you follow.
    // For now, let's fetch all active stories.
    const stories = await Story.find()
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });
    
    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.userId._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: story.userId,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    res.json(Object.values(groupedStories));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
