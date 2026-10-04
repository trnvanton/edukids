const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { optionalAuth } = require('../middleware/auth');

router.post('/submit', optionalAuth, quizController.submitQuiz);
router.get('/history', optionalAuth, quizController.getHistory);

module.exports = router;
