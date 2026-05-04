process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const path = require('path');
const dotenv = require('dotenv');

// Load env from common locations so tests behave like `npm start`
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.test') });

beforeAll(async () => {
  // Unit tests should not require a live DB connection.
});

afterAll(async () => {
  // DB is managed per integration test suite (so unit tests don't fail).
});

