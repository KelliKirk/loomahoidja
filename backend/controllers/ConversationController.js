const fs = require('fs');

const ConversationService = require('../services/conversationService');
const { validateTextMessagePayload } = require('../validation/messageValidation');

class ConversationController {
  static async createOrGet(req, res, next) {
    try {
      const userId = req.user.id;
      const { otherUserId, contextType = null, contextId = null } = req.body || {};

      if (!otherUserId) return res.status(400).json({ error: 'otherUserId is required' });
      if (Number(otherUserId) === Number(userId)) return res.status(400).json({ error: 'Cannot create conversation with yourself' });

      const convo = await ConversationService.createOrGetConversation({
        userId,
        otherUserId,
        contextType,
        contextId,
      });
      return res.status(200).json(convo);
    } catch (err) {
      next(err);
    }
  }

  static async listMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      const after = req.query.after ? Number(req.query.after) : null;
      const limit = req.query.limit ? Math.min(200, Math.max(1, Number(req.query.limit))) : 50;

      await ConversationService.assertUserInConversation({ conversationId, userId });
      const rows = await ConversationService.listMessages({ conversationId, afterId: after, limit });
      return res.status(200).json({ count: rows.length, messages: rows });
    } catch (err) {
      next(err);
    }
  }

  static async postTextMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;

      await ConversationService.assertUserInConversation({ conversationId, userId });
      const validation = validateTextMessagePayload(req.body);
      if (!validation.ok) return res.status(400).json({ error: validation.errors[0] });

      const msg = await ConversationService.createTextMessage({
        conversationId,
        senderId: userId,
        text: String(req.body.text),
      });
      return res.status(201).json({ message: msg });
    } catch (err) {
      next(err);
    }
  }

  static async postImageMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      await ConversationService.assertUserInConversation({ conversationId, userId });

      if (!req.file) return res.status(400).json({ error: 'Image is required' });

      const { msg, attachment } = await ConversationService.createImageMessage({
        conversationId,
        senderId: userId,
        file: req.file,
      });

      return res.status(201).json({ message: msg, attachment });
    } catch (err) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(err);
    }
  }
}

module.exports = ConversationController;

