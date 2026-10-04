const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/sync.controller');

router.get('/', SyncController.getSyncData);
router.post('/exercise', SyncController.saveExercise);
router.delete('/exercise/:id', SyncController.deleteExercise);
router.post('/submission', SyncController.saveSubmission);
router.get('/health', SyncController.health);

module.exports = router;
