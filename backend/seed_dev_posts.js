require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

const MONGODB_URI = process.env.MONGODB_URI;

const usersData = [
  { username: 'code_ninja', email: 'ninja@dev.com', password: 'password123', bio: 'Living in the terminal.' },
  { username: 'frontend_wizard', email: 'wizard@dev.com', password: 'password123', bio: 'CSS is my canvas.' },
  { username: 'backend_guru', email: 'guru@dev.com', password: 'password123', bio: 'Scaling systems to infinity.' }
];

const postsData = [
  { username: 'code_ninja', content: 'Just spent 4 hours debugging a missing semicolon. The developer world is a cruel, yet beautiful place. 💻😭' },
  { username: 'code_ninja', content: 'Vim vs Emacs? I prefer just writing machine code using butterflies. 🦋' },
  { username: 'frontend_wizard', content: 'Why do they call it centering a div when it feels more like performing dark magic? 🧙‍♂️✨ #frontend' },
  { username: 'frontend_wizard', content: 'The gap between a designer\'s Figma file and my reality is vast and full of terrors. 🎨📉' },
  { username: 'backend_guru', content: 'My favorite part of the day is when the pipeline finally turns green after 12 failed attempts. 🟢🚀' },
  { username: 'backend_guru', content: 'If you think caching is easy, you clearly haven\'t invalidated one at 3 AM on a Saturday. ☕🔥' }
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
        content: postData.content
      });
      console.log(`Created post for ${user.username}`);
    }

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
}

seed();
