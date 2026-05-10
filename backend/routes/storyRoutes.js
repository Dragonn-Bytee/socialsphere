const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, storyController.createStory);
router.get('/feed', auth, storyController.getStoriesFeed);

module.exports = router;
