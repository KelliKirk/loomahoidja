const jwt = require('jsonwebtoken');

const app = require('../../App');
const { sequelize } = require('../../config/database');
const { User, Conversation, ConversationParticipant, MessageAttachment } = require('../../models');

async function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function authHeader(token) {
  return { authorization: `Bearer ${token}` };
}

describe('Messaging + in-app notifications (HTTP full flow)', () => {
  let server;
  let baseUrl;
  let owner;
  let sitter;
  let ownerToken;
  let sitterToken;
  let conversationId;

  beforeAll(async () => {
    try {
      await sequelize.authenticate();
    } catch (err) {
      const host = process.env.DB_HOST || 'localhost';
      const user = process.env.DB_USER || 'root';
      const db = process.env.DB_TEST_DATABASE || process.env.DB_DATABASE || 'petsitting';
      throw new Error(
        [
          'Cannot connect to MariaDB for messaging integration tests.',
          `Host=${host} User=${user} Database=${db}`,
          'Set DB_HOST/DB_USER/DB_PASSWORD/DB_DATABASE (or DB_TEST_DATABASE) in backend/.env before running `npm run test:integration`.',
          `Original error: ${err.message}`,
        ].join('\n')
      );
    }
    await sequelize.sync({ alter: false });
    ({ server, baseUrl } = await startServer());

    owner = await User.create({
      email: `jest-owner-${Date.now()}@example.com`,
      passwordHash: 'x',
      fullName: 'Owner',
      city: 'Tartu',
      role: 'owner',
    });
    sitter = await User.create({
      email: `jest-sitter-${Date.now()}@example.com`,
      passwordHash: 'x',
      fullName: 'Sitter',
      city: 'Tartu',
      role: 'sitter',
    });

    ownerToken = jwt.sign({ id: owner.id, email: owner.email, role: owner.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    sitterToken = jwt.sign({ id: sitter.id, email: sitter.email, role: sitter.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    if (server) await new Promise((r) => server.close(r));
    if (owner) await owner.destroy();
    if (sitter) await sitter.destroy();
    await sequelize.close();
  });

  test('POST conversation → POST text → GET messages → notifications unread/read', async () => {
    // create/get conversation
    const convoRes = await fetch(`${baseUrl}/api/conversations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader(ownerToken) },
      body: JSON.stringify({ otherUserId: sitter.id, contextType: 'booking', contextId: 123 }),
    });
    expect(convoRes.status).toBe(200);
    const convo = await convoRes.json();
    conversationId = convo.id;

    // ensure sitter is participant (repo-level check)
    const p = await ConversationParticipant.findOne({ where: { conversationId, userId: sitter.id } });
    expect(p).not.toBeNull();

    // post text message
    const msgRes = await fetch(`${baseUrl}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader(ownerToken) },
      body: JSON.stringify({ text: 'hello' }),
    });
    expect(msgRes.status).toBe(201);
    const msgBody = await msgRes.json();
    expect(msgBody.message.type).toBe('text');

    // list messages as sitter
    const listRes = await fetch(`${baseUrl}/api/conversations/${conversationId}/messages`, {
      headers: { ...authHeader(sitterToken) },
    });
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list.count).toBeGreaterThanOrEqual(1);

    // sitter has unread notification
    const notifRes = await fetch(`${baseUrl}/api/notifications?unreadOnly=true`, {
      headers: { ...authHeader(sitterToken) },
    });
    expect(notifRes.status).toBe(200);
    const notifs = await notifRes.json();
    expect(notifs.notifications.some((n) => n.type === 'new_message' && Number(n.entityId) === Number(conversationId))).toBe(true);

    const idsToRead = notifs.notifications.map((n) => n.id);
    const readRes = await fetch(`${baseUrl}/api/notifications/read`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader(sitterToken) },
      body: JSON.stringify({ ids: idsToRead }),
    });
    expect(readRes.status).toBe(200);
  });

  test('POST image → GET messages includes attachment', async () => {
    // Ensure conversation exists
    const conversation = await Conversation.findByPk(conversationId);
    expect(conversation).not.toBeNull();

    const form = new FormData();
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]); // minimal JPEG markers
    form.append('image', new Blob([bytes], { type: 'image/jpeg' }), 'test.jpg');

    const imgRes = await fetch(`${baseUrl}/api/conversations/${conversationId}/messages/image`, {
      method: 'POST',
      headers: { ...authHeader(ownerToken) },
      body: form,
    });
    expect(imgRes.status).toBe(201);
    const imgBody = await imgRes.json();
    expect(imgBody.attachment.path).toMatch(/^messages\//);

    const attachment = await MessageAttachment.findByPk(imgBody.attachment.id);
    expect(attachment).not.toBeNull();

    const listRes = await fetch(`${baseUrl}/api/conversations/${conversationId}/messages`, {
      headers: { ...authHeader(ownerToken) },
    });
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    const hasAttachment = list.messages.some((m) => Array.isArray(m.MessageAttachments) && m.MessageAttachments.length > 0);
    expect(hasAttachment).toBe(true);
  });
});

