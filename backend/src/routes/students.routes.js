const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/student.controller');
const { optionalAuth, authenticateToken } = require('../middleware/auth.middleware');

router.get('/dashboard', optionalAuth, StudentController.getDashboard);
router.put('/settings', authenticateToken, StudentController.updateSettings);

module.exports = router;
