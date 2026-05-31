const express = require('express');
const documentController = require('../../controller/documentController');
const protect = require('../../middleware/authMiddlware');

const router = express.Router();
router.use(protect);
router.post('/createdocument', protect, documentController.createDocument);

module.exports = router;
