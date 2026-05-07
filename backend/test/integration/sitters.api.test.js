const jwt = require('jsonwebtoken');

const app = require('../../App');
const { sequelize } = require('../../config/database');
const { User, SitterProfile } = require('../../models');

async function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

describe('Sitter profile API (auth required)', () => {
  let server;
  let baseUrl;
  let owner;
  let sitter;
  let ownerToken;

  beforeAll(async () => {
    try {
      await sequelize.authenticate();
    } catch (err) {
      const host = process.env.DB_HOST || 'localhost';
      const user = process.env.DB_USER || 'root';
      const db = process.env.DB_TEST_DATABASE || process.env.DB_DATABASE || 'petsitting';
      throw new Error(
        [
          'Cannot connect to MariaDB for sitter integration tests.',
          `Host=${host} User=${user} Database=${db}`,
          'Set DB_HOST/DB_USER/DB_PASSWORD/DB_DATABASE (or DB_TEST_DATABASE) in backend/.env before running `npm run test:integration`.',
          `Original error: ${err.message}`,
        ].join('\n'),
      );
    }
    await sequelize.sync({ alter: false });
    ({ server, baseUrl } = await startServer());

    const ts = Date.now();
    owner = await User.create({
      email: `jest-owner-sp-${ts}@example.com`,
      passwordHash: 'x',
      fullName: 'Owner',
      role: 'owner',
    });
    sitter = await User.create({
      email: `jest-sitter-sp-${ts}@example.com`,
      passwordHash: 'x',
      fullName: 'Sitter',
      role: 'sitter',
    });

    ownerToken = jwt.sign(
      { id: owner.id, email: owner.email, role: owner.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    if (server) {
      await new Promise((r) => server.close(r));
    }
    await SitterProfile.destroy({ where: { userId: [owner.id, sitter.id] } });
    if (owner) await owner.destroy();
    if (sitter) await sitter.destroy();
    await sequelize.close();
  });

  test('POST /api/sitters/profile rejects unauthenticated requests', async () => {
    const fd = new FormData();
    fd.append('hourlyRate', '10');
    fd.append('bio', 'x');
    const res = await fetch(`${baseUrl}/api/sitters/profile`, { method: 'POST', body: fd });
    expect(res.status).toBe(401);
  });

  test('POST /api/sitters/profile rejects non-sitter role', async () => {
    const fd = new FormData();
    fd.append('hourlyRate', '10');
    const res = await fetch(`${baseUrl}/api/sitters/profile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: fd,
    });
    expect(res.status).toBe(403);
  });

  test('DELETE /api/sitters/profile/:id rejects unauthenticated requests', async () => {
    const res = await fetch(`${baseUrl}/api/sitters/profile/999999`, { method: 'DELETE' });
    expect(res.status).toBe(401);
  });
});
