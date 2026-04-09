# How to Run the Backend Server

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Ensure `.env` has:
```env
PORT=3001
DB_HOST=192.168.26.161
DB_USER=root
DB_PASSWORD=Qwerty1!
DB_DATABASE=petsitting
JWT_SECRET=petsitting_secret_key_2024
```

### 3. Run the Server
```bash
npm start
```

## Expected Output
```
✓ Database connected successfully
✓ Models synced with database
✓ Server running on port 3000
✓ Animals API available at http://localhost:3001/animals
✓ Health check: GET http://localhost:3001/health
```

## API Endpoints

### Generate Token (No Auth Required)
```bash
POST http://localhost:3001/auth/test-token

Body:
{
  "userId": 1,
  "email": "test@example.com"
}
```

### Animal CRUD (Auth Required)
```bash
# Create Pet
POST http://localhost:3001/animals
Headers: Authorization: Bearer {token}
Body: multipart/form-data

# List User's Pets
GET http://localhost:3001/animals
Headers: Authorization: Bearer {token}

# Get Single Pet
GET http://localhost:3001/animals/:id
Headers: Authorization: Bearer {token}

# Update Pet
PUT http://localhost:3001/animals/:id
Headers: Authorization: Bearer {token}

# Delete Pet
DELETE http://localhost:3001/animals/:id
Headers: Authorization: Bearer {token}
```

## Seed Demo Data

Load demo users, sitter profiles, animals, and animal types:

```bash
# Run all seeders in order
node seeders/seed-demo-users.js && \
node seeders/seed-demo-sitter-profiles.js && \
node seeders/seed-demo-sitter-animal-types.js && \
node seeders/demo-animals.js
```

Or run individual seeders:
```bash
node seeders/seed-demo-users.js      # Creates 2 test users
node seeders/seed-demo-sitter-profiles.js  # Creates sitter profile
node seeders/seed-demo-sitter-animal-types.js  # Assigns animal types to sitters
node seeders/demo-animals.js         # Creates 5 demo animals
```

**Demo Data Created:**
- Users: `owner@test.com` and `sitter@test.com` (password: `Test123!`)
- Sitter profile for Jaan Tamm (€8.50/hr, handles dogs/cats/birds)
- 5 animals: Max, Luna, Charlie, Milo, Buddy

See `SEEDING_GUIDE.md` for detailed seeding documentation.

## Troubleshooting

**Port Already in Use:**
```bash
PORT=3001 npm start
```

**Database Connection Failed:**
- Verify MySQL is running on 192.168.26.161
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
