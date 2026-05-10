const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/feed', authMiddleware, postController.getFeed);
router.post('/', authMiddleware, postController.createPost);
router.post('/:id/like', authMiddleware, postController.likePost);
router.delete('/:id', authMiddleware, postController.deletePost);
router.post('/:id/comments', authMiddleware, postController.addComment);
router.get('/:id/comments', authMiddleware, postController.getComments);
router.get('/user/:userId', authMiddleware, postController.getUserPosts);

module.exports = router;
