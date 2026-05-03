require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { sequelize } = require('../config/database');
const {
  User,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  Notification,
} = require('../models');

const OWNER_EMAIL = 'owner@test.com';
const SITTER_EMAIL = 'sitter@test.com';

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'messages');
const DEMO_IMAGE_FILENAME = 'demo-1px.png';

function ensureDemoImage() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const imgPath = path.join(UPLOAD_DIR, DEMO_IMAGE_FILENAME);
  if (fs.existsSync(imgPath)) return imgPath;

  // 1x1 transparent PNG
  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6rS8h8AAAAASUVORK5CYII=';
  fs.writeFileSync(imgPath, Buffer.from(base64, 'base64'));
  return imgPath;
}

async function getOrCreateConversation({ ownerId, sitterId }) {
  // One demo conversation per context (booking, 1)
  const contextType = 'booking';
  const contextId = 1;

  const existing = await Conversation.findOne({ where: { contextType, contextId } });
  if (existing) return existing;

  const convo = await Conversation.create({ contextType, contextId });
  await ConversationParticipant.bulkCreate([
    { conversationId: convo.id, userId: ownerId, role: 'owner' },
    { conversationId: convo.id, userId: sitterId, role: 'sitter' },
  ]);
  return convo;
}

async function seedDemoMessages() {
  try {
    console.log('💬 Seeding demo messages...\n');
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });

    const owner = await User.findOne({ where: { email: OWNER_EMAIL } });
    const sitter = await User.findOne({ where: { email: SITTER_EMAIL } });

    if (!owner || !sitter) {
      console.error('✗ Demo users missing. Run seed-demo-users.js first.');
      process.exit(1);
    }

    const convo = await getOrCreateConversation({ ownerId: owner.id, sitterId: sitter.id });

    // Seed a couple of text messages if none exist
    const existingCount = await Message.count({ where: { conversationId: convo.id } });
    if (existingCount === 0) {
      const m1 = await Message.create({
        conversationId: convo.id,
        senderId: owner.id,
        type: 'text',
        text: 'Hi! Just checking in — how is Max doing today?',
      });
      const m2 = await Message.create({
        conversationId: convo.id,
        senderId: sitter.id,
        type: 'text',
        text: 'All good! We went for a walk and he ate well.',
      });

      // Demo image message
      ensureDemoImage();
      const imgMsg = await Message.create({
        conversationId: convo.id,
        senderId: sitter.id,
        type: 'image',
        text: null,
      });
      await MessageAttachment.create({
        messageId: imgMsg.id,
        kind: 'image',
        path: `messages/${DEMO_IMAGE_FILENAME}`,
        mime: 'image/png',
        size: fs.statSync(path.join(UPLOAD_DIR, DEMO_IMAGE_FILENAME)).size,
      });

      // Create one unread notification for the owner about the latest sitter message
      await Notification.findOrCreate({
        where: {
          userId: owner.id,
          type: 'new_message',
          entityType: 'conversation',
          entityId: convo.id,
        },
        defaults: {
          payload: JSON.stringify({ messageId: m2.id }),
          readAt: null,
        },
      });

      console.log(`✓ Created demo conversation ${convo.id} with 3 messages`);
    } else {
      console.log(`⊘ Skipped: conversation ${convo.id} already has messages`);
    }

    console.log('\n✓ Demo messages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding demo messages:', error.message);
    process.exit(1);
  }
}

seedDemoMessages();

