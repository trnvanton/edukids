const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/switch-demo', AuthController.switchDemoUser);
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;
