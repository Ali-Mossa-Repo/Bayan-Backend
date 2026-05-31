const express = require('express');
const authenticateToken = require('../middleware/authMiddlware');
const router = express.Router();
const { getCommits, restoreCommit, cloneAtCommit } = require('../controller/gitController');

router.get('/commits', authenticateToken, getCommits);
router.post('/cloneAtCommit', authenticateToken, cloneAtCommit);


module.exports = router;
