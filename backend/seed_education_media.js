require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

const MONGODB_URI = process.env.MONGODB_URI;
const BACKEND_URL = 'http://localhost:5000';

const usersData = [
  { username: 'edu_explorer', email: 'edu@explorer.com', password: 'password123', bio: 'Life is a continuous learning process.' },
  { username: 'knowledge_hub', email: 'hub@knowledge.com', password: 'password123', bio: 'Sharing insights and educational resources.' }
];

const postsData = [
  { 
    username: 'edu_explorer', 
    content: 'A glimpse into the future of learning. Modern classrooms are changing the way we interact with information! 🏫✨',
    image: `${BACKEND_URL}/uploads/classroom.png`
  },
  { 
    username: 'knowledge_hub', 
    content: 'Nothing beats the smell of old books and the quiet atmosphere of a library. Perfect for deep focus. 📚☕',
    image: `${BACKEND_URL}/uploads/library.png`
  },
  {
    username: 'edu_explorer',
    content: 'Check out this short animation about how the brain learns new things! (Sample Video) 🧠🎬',
    video: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB.');

    const createdUsers = {};

    for (const userData of usersData) {
      let user = await User.findOne({ username: userData.username });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created user: ${user.username}`);
      } else {
        console.log(`User already exists: ${user.username}`);
      }
      createdUsers[user.username] = user;
    }

    for (const postData of postsData) {
      const user = createdUsers[postData.username];
      await Post.create({
        userId: user._id,
        content: postData.content,
        image: postData.image || '',
        video: postData.video || ''
      });
      console.log(`Created educational post for ${user.username}`);
    }

    console.log('Educational seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
}

seed();
