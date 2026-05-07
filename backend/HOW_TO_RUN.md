# How to Run the Backend Server

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

## Running Tests (Jest)

### Unit tests
Unit tests do **not** require a live database connection.

```bash
cd backend
npm test
```

### Integration tests (HTTP, uses MariaDB)
Integration tests require a reachable MariaDB and correct `DB_*` variables in `.env`.

```bash
cd backend
npm run test:integration
```

### 2. Configure Environment Variables
Copy the example file and fill in your local values:

```bash
cp .env.example .env
```

Ensure `.env` has (values are examples/placeholders):
```env
PORT=3001
DB_HOST=<your-db-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_DATABASE=petsitting
DB_TEST_DATABASE=petsitting_test
JWT_SECRET=<your-jwt-secret>
```

### 3. Run the Server
```bash
npm start
```

## Expected Output
```
✓ Database connected successfully
✓ Models synced with database
✓ Server running
✓ API available
✓ Health check available
```

## API Endpoints

### Generate Token (No Auth Required)
```bash
POST http://localhost:<PORT>/api/auth/test-token

Body:
{
  "userId": 1,
  "email": "test@example.com"
}
```

### Animal CRUD (Auth Required)
```bash
# Create Pet
POST http://localhost:<PORT>/api/animals
Headers: Authorization: Bearer {token}
Body: multipart/form-data

# List User's Pets
GET http://localhost:<PORT>/api/animals
Headers: Authorization: Bearer {token}

# Get Single Pet
GET http://localhost:<PORT>/api/animals/:id
Headers: Authorization: Bearer {token}

# Update Pet
PUT http://localhost:<PORT>/api/animals/:id
Headers: Authorization: Bearer {token}

# Delete Pet
DELETE http://localhost:<PORT>/api/animals/:id
Headers: Authorization: Bearer {token}
```

## Seed Demo Data

Set **`DEMO_SEED_PASSWORD`** in `backend/.env` (same value is used for both demo accounts). **Do not commit** `.env` or share passwords in the issue tracker—only this template documents the variable name.

Load demo users, sitter profiles, animals, and animal types:

```bash
# Run all seeders in order
node seeders/seed-demo-users.js && \
node seeders/seed-demo-sitter-profiles.js && \
node seeders/seed-demo-sitter-animal-types.js && \
node seeders/demo-animals.js && \
node seeders/seed-demo-messages.js
```

Or run individual seeders:
```bash
node seeders/seed-demo-users.js      # Creates 2 test users
node seeders/seed-demo-sitter-profiles.js  # Creates sitter profile
node seeders/seed-demo-sitter-animal-types.js  # Assigns animal types to sitters
node seeders/demo-animals.js         # Creates 5 demo animals
node seeders/seed-demo-messages.js   # Creates demo conversation + messages (+ image)
```

**Demo Data Created:**
- **Darude Sandstorm** (owner) — `darude@example.com`
- **Toru Jüri** (sitter) — `toru@example.com`  
  Both use the password you set as **`DEMO_SEED_PASSWORD`** when you ran the user seed.
- Sitter profile for Toru Jüri (€8.50/hr, handles dogs/cats/birds)
- 5 animals for Darude: Max, Luna, Charlie, Milo, Buddy

Use **Sign in** with these accounts (`/auth/login`). Re-run seeders on a fresh database if you change emails or need to recreate rows.

See `SEEDING_GUIDE.md` for detailed seeding documentation.

## Troubleshooting

**Port Already in Use:**
```bash
PORT=3001 npm start
```

**Database Connection Failed:**
- Verify MariaDB/MySQL is running on your configured `DB_HOST`
- Check credentials in .env
- Ensure database `petsitting` exists

**Test Database Connection:**
```bash
node test-db-connection.js
```

## Development

Enable SQL logging:
```bash
NODE_ENV=development npm start
```

See `POSTMAN_GUIDE.md` for detailed Postman testing instructions.
