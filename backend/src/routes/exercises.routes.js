const express = require('express');
const router = express.Router();
const ExerciseController = require('../controllers/exercise.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/:id', ExerciseController.getById);
router.post('/submit', optionalAuth, ExerciseController.submit);

module.exports = router;
