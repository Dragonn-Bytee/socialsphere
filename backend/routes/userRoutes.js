const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/search', authMiddleware, userController.searchUsers);
router.get('/:id', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/:id/follow', authMiddleware, userController.followUser);

module.exports = router;
