## Testing (Jest) – overview

### Goals
- Unit tests cover business logic and validation (pure functions + Service layer).
- Integration tests cover full HTTP flows `Controller → Service → Repository (Model)`.

### Running

Backend tests (local):

```bash
cd backend
npm install
npm test
```

Integration tests (HTTP, uses MariaDB):

```bash
cd backend
npm run test:integration
```

### Notes
- **DB**: integration tests use MariaDB connection (`DB_HOST/DB_USER/DB_PASSWORD/DB_DATABASE` or `DB_TEST_DATABASE`).
- **Auth**: tests generate a JWT using `JWT_SECRET` (default in scripts is `test-secret`).
- **API flows**: `backend/test/integration/animals.api.test.js` covers at least `POST → GET → PUT → DELETE` plus error handling (401 without token, 400 invalid payload).
- **Messaging flows**: `backend/test/integration/messaging.api.test.js` covers conversation creation, text + image messages, and in-app notifications (unread → read).

