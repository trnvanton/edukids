const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/sync.controller');

router.get('/', SyncController.getSyncData);
router.post('/exercise', SyncController.saveExercise);
router.delete('/exercise/:id', SyncController.deleteExercise);
router.post('/class', SyncController.saveClass);
router.delete('/class/:id', SyncController.deleteClass);
router.post('/student', SyncController.saveStudent);
router.delete('/student/:id', SyncController.deleteStudent);
router.post('/submission', SyncController.saveSubmission);
router.get('/health', SyncController.health);

module.exports = router;
