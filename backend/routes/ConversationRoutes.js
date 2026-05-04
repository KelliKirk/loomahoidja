const express = require('express');
const auth = require('../middleware/auth');
const ConversationController = require('../controllers/ConversationController');
const uploadMessageImage = require('../middleware/uploadMessageImage');

const router = express.Router();

router.use(auth);

router.post('/', ConversationController.createOrGet);
router.get('/:id/messages', ConversationController.listMessages);
router.post('/:id/messages', ConversationController.postTextMessage);
router.post('/:id/messages/image', uploadMessageImage.single('image'), ConversationController.postImageMessage);

module.exports = router;

