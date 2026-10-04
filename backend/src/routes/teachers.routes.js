const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/teacher.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/dashboard', optionalAuth, TeacherController.getDashboard);
router.post('/assign', optionalAuth, TeacherController.assignExercise);

module.exports = router;
