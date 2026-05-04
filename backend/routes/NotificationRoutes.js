const express = require('express');
const auth = require('../middleware/auth');
const NotificationController = require('../controllers/NotificationController');

const router = express.Router();

router.use(auth);

router.get('/', NotificationController.list);
router.post('/read', NotificationController.markRead);

module.exports = router;

