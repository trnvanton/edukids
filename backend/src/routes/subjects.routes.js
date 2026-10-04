const express = require('express');
const router = express.Router();
const SubjectController = require('../controllers/subject.controller');

router.get('/', SubjectController.getAll);
router.get('/:subjectId/lessons', SubjectController.getLessonsBySubject);

module.exports = router;
