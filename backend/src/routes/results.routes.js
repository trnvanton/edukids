const express = require('express');
const router = express.Router();
const ResultController = require('../controllers/result.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/history', optionalAuth, ResultController.getHistory);
router.get('/leaderboard', ResultController.getLeaderboard);

module.exports = router;
