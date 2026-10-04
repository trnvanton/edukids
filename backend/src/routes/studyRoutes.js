const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');

router.get('/grades', studyController.getGrades);
router.get('/subjects', studyController.getSubjects);
router.get('/topics', studyController.getTopics);
router.get('/quiz/:id', studyController.getQuizById);

module.exports = router;
