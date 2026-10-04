const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/class.controller');

router.get('/', ClassController.getAll);
router.get('/:id', ClassController.getById);

module.exports = router;
