const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, friendController.getFriends);
router.get('/requests', authMiddleware, friendController.getPendingRequests);
router.post('/request/:id', authMiddleware, friendController.sendRequest);
router.post('/accept/:requestId', authMiddleware, friendController.acceptRequest);
router.post('/decline/:requestId', authMiddleware, friendController.declineRequest);

module.exports = router;
