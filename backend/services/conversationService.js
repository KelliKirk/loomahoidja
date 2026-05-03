const { Op } = require('sequelize');
const {
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  Notification,
} = require('../models');

async function createOrGetConversation({ userId, otherUserId, contextType = null, contextId = null }) {
  // If context is provided, allow one conversation per (contextType, contextId) for same pair.
  if (contextType && contextId) {
    const existing = await Conversation.findOne({ where: { contextType, contextId } });
    if (existing) {
      const count = await ConversationParticipant.count({
        where: {
          conversationId: existing.id,
          userId: { [Op.in]: [userId, otherUserId] },
        },
      });
      if (count === 2) return existing;
    }
  }

  const conversation = await Conversation.create({ contextType, contextId });
  await ConversationParticipant.bulkCreate([
    { conversationId: conversation.id, userId },
    { conversationId: conversation.id, userId: otherUserId },
  ]);
  return conversation;
}

async function assertUserInConversation({ conversationId, userId }) {
  const exists = await ConversationParticipant.findOne({ where: { conversationId, userId } });
  if (!exists) {
    const err = new Error('Unauthorized');
    err.status = 403;
    throw err;
  }
}

async function listMessages({ conversationId, afterId = null, limit = 50 }) {
  const where = { conversationId };
  if (afterId) where.id = { [Op.gt]: afterId };
  const rows = await Message.findAll({
    where,
    order: [['id', 'ASC']],
    limit,
    include: [{ model: MessageAttachment }],
  });
  return rows;
}

async function createTextMessage({ conversationId, senderId, text }) {
  const msg = await Message.create({
    conversationId,
    senderId,
    type: 'text',
    text,
  });
  await createNotificationsForOtherParticipants({ conversationId, senderId, messageId: msg.id });
  return msg;
}

async function createImageMessage({ conversationId, senderId, file }) {
  const msg = await Message.create({
    conversationId,
    senderId,
    type: 'image',
    text: null,
  });

  const attachment = await MessageAttachment.create({
    messageId: msg.id,
    kind: 'image',
    path: `messages/${file.filename}`,
    mime: file.mimetype,
    size: file.size,
  });

  await createNotificationsForOtherParticipants({ conversationId, senderId, messageId: msg.id });
  return { msg, attachment };
}

async function createNotificationsForOtherParticipants({ conversationId, senderId, messageId }) {
  const participants = await ConversationParticipant.findAll({ where: { conversationId } });
  const recipientIds = participants
    .map((p) => p.userId)
    .filter((id) => Number(id) !== Number(senderId));

  if (recipientIds.length === 0) return;

  await Notification.bulkCreate(
    recipientIds.map((userId) => ({
      userId,
      type: 'new_message',
      entityType: 'conversation',
      entityId: conversationId,
      payload: JSON.stringify({ messageId }),
      readAt: null,
    }))
  );
}

module.exports = {
  createOrGetConversation,
  assertUserInConversation,
  listMessages,
  createTextMessage,
  createImageMessage,
};

