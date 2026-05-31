const express = require('express');
const { signup, login, getProfile, refreshToken } = require('../controller/userController');
const authenticateToken = require('../middleware/authMiddlware');

const router = express.Router();

router.post('/register', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getProfile);
router.get('/refresh', refreshToken);


module.exports = router;
