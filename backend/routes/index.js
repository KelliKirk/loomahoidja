const express = require('express');
const AnimalRoutes = require('./AnimalRoutes');
const AuthRoutes = require('./AuthRoutes');

const router = express.Router();

// Auth routes (no authentication required)
router.use('/auth', AuthRoutes);

// Animal routes (requires authentication)
router.use('/animals', AnimalRoutes);

module.exports = router;
