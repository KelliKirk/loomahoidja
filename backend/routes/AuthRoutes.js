const express = require('express');
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate test token (no auth required)
router.post('/test-token', AuthController.generateTestToken);

// Verify token (has token in header)
router.get('/verify-token', auth, AuthController.verifyToken);

module.exports = router;
