## Testing (Jest) – overview

### Goals
- **Unit** tests cover validation helpers and service logic without HTTP or DB (where applicable).
- **Integration** tests spin up the real Express app and hit HTTP endpoints with **MariaDB/MySQL** (full `Controller → Service → Model` flow).

### Running

From `backend/`:

| Command | Scope |
|---------|--------|
| `npm test` | Same as `npm run test:unit` |
| `npm run test:unit` | Unit tests only (`test/unit`) |
| `npm run test:integration` | Integration tests only (`test/integration`) |
| `npm run test:all` | **Unit + integration** (recommended before merge) |

Install deps once: `cd backend && npm install`.

### Notes
- **DB**: integration tests need a running database. Use `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE` or prefer **`DB_TEST_DATABASE`** for isolation.
- **Auth**: tests use `NODE_ENV=test` and `JWT_SECRET` (see `package.json` scripts; typically `test-secret`).
- **Animals**: `test/integration/animals.api.test.js` — 401 without token, happy path `POST → GET → PUT → DELETE`, validation errors.
- **Messaging**: `test/integration/messaging.api.test.js` — conversation create/get, text + image messages, notifications unread → read.
- **Sitter profile**: `test/integration/sitters.api.test.js` — `POST /api/sitters/profile` and `DELETE` require JWT; non-sitter cannot upsert profile.
- **Frontend**: ESLint only (`frontend/loomahoidja`); no Vitest/Jest in `package.json` yet.
