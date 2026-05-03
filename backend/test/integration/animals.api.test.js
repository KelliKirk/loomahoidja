const jwt = require('jsonwebtoken');

const app = require('../../App');
const { sequelize } = require('../../config/database');
const { User, Animal } = require('../../models');

async function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

describe('Animals API (Controller ↔ Service ↔ Repository full flow)', () => {
  let server;
  let baseUrl;
  let token;
  let user;

  beforeAll(async () => {
    try {
      await sequelize.authenticate();
    } catch (err) {
      const host = process.env.DB_HOST || 'localhost';
      const user = process.env.DB_USER || 'root';
      const db = process.env.DB_TEST_DATABASE || process.env.DB_DATABASE || 'petsitting';
      throw new Error(
        [
          'Cannot connect to MariaDB for integration tests.',
          `Host=${host} User=${user} Database=${db}`,
          'Set DB_HOST/DB_USER/DB_PASSWORD/DB_DATABASE (or DB_TEST_DATABASE) in .env before running `npm run test:integration`.',
          `Original error: ${err.message}`,
        ].join('\n')
      );
    }
    ({ server, baseUrl } = await startServer());

    user = await User.create({
      email: `jest-owner-${Date.now()}@example.com`,
      passwordHash: 'x',
      fullName: 'Owner',
      city: 'Tartu',
      role: 'owner',
    });

    token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (server) {
      await new Promise((r) => server.close(r));
    }
    if (user) {
      await user.destroy();
    }
    await sequelize.close();
  });

  test('rejects requests without token', async () => {
    const res = await fetch(`${baseUrl}/api/animals`, { method: 'GET' });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'No token provided' });
  });

  test('POST → GET → PUT → DELETE happy path with status codes', async () => {
    // POST
    const createRes = await fetch(`${baseUrl}/api/animals`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Rex', animalType: 'dog', age: 3 }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.animal.name).toBe('Rex');
    const animalId = created.animal.id;

    // GET
    const getRes = await fetch(`${baseUrl}/api/animals/${animalId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.id).toBe(animalId);

    // PUT
    const putRes = await fetch(`${baseUrl}/api/animals/${animalId}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notes: 'updated', goodWithChildren: true }),
    });
    expect(putRes.status).toBe(200);
    const updated = await putRes.json();
    expect(updated.animal.notes).toBe('updated');
    expect(updated.animal.goodWithChildren).toBe(true);

    // DELETE
    const delRes = await fetch(`${baseUrl}/api/animals/${animalId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(delRes.status).toBe(200);

    const stillThere = await Animal.findByPk(animalId);
    expect(stillThere).toBeNull();
  });

  test('POST validates payload and returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/animals`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ animalType: 'dog' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Name is required' });
  });
});

