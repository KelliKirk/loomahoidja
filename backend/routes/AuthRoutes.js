const express = require('express');
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const blockInProduction = require('../middleware/blockInProduction');

const router = express.Router();

router.post('/test-token', blockInProduction, AuthController.generateTestToken);
router.get('/verify-token', auth, AuthController.verifyToken);
router.put('/update-role', blockInProduction, AuthController.updateRole);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', auth, AuthController.me);

module.exports = router;
