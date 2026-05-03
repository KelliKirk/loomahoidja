const express = require('express');
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

const router = express.Router();

// Auth (used by frontend)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', auth, (req, res) => res.json(req.user));

// Generate test token (no auth required)
router.post('/test-token', AuthController.generateTestToken);

// Verify token (has token in header)
router.get('/verify-token', auth, AuthController.verifyToken);

// Update user role (no auth required for testing, but could add auth)
router.put('/update-role', AuthController.updateRole);

module.exports = router;
