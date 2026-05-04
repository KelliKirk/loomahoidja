# Pet Profile CRUD - Setup & Testing Guide

## Overview
Complete pet profile (animal) CRUD backend with JWT authentication, file uploads, and demo data seeding.

## Quick Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Ensure .env is configured
cat .env  # Should have DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET (do not commit this file)

# 3. Start server
npm start

# 4. In another terminal, seed demo data
node seeders/demo-animals.js

# 5. Done! API is ready
```

## API Endpoints

### Authentication (No Auth Required)
```
POST /api/auth/test-token
  → Get JWT token for testing

GET /api/auth/verify-token
  → Verify token validity
```

### Pet Profiles (Requires Auth Token)
```
POST /api/animals
  → Create pet (with optional photo)

GET /api/animals
  → List all user's pets

GET /api/animals/:id
  → Get single pet

PUT /api/animals/:id
  → Update pet (with optional photo)

DELETE /api/animals/:id
  → Delete pet (removes photo)
```

## Demo Animals

5 sample animals are available via seeder:
- Max (Dog, 3y) - Friendly golden retriever
- Luna (Cat, 2y) - Independent tabby
- Charlie (Dog, 5y) - Energetic border collie
- Milo (Bird, 1y) - Colorful parakeet
- Buddy (Dog, 7y) - Calm senior

Load with:
```bash
node seeders/demo-animals.js
```

## Testing Workflow

### 1. Get Token
```bash
curl -X POST http://localhost:<PORT>/api/auth/test-token \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "email": "test@example.com"}'
```

### 2. Create Pet
```bash
curl -X POST http://localhost:<PORT>/api/animals \
  -H "Authorization: Bearer {TOKEN}" \
  -F "name=Fluffy" \
  -F "animalType=cat" \
  -F "age=2"
```

### 3. List Pets
```bash
curl -X GET http://localhost:<PORT>/api/animals \
  -H "Authorization: Bearer {TOKEN}"
```

### 4. Get Single Pet
```bash
curl -X GET http://localhost:<PORT>/api/animals/1 \
  -H "Authorization: Bearer {TOKEN}"
```

### 5. Update Pet
```bash
curl -X PUT http://localhost:<PORT>/api/animals/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"age": 3, "notes": "Updated info"}'
```

### 6. Delete Pet
```bash
curl -X DELETE http://localhost:<PORT>/api/animals/1 \
  -H "Authorization: Bearer {TOKEN}"
```

## File Structure
```
backend/
├── config/database.js          - Sequelize setup
├── controllers/AnimalController.js - CRUD logic
├── middleware/
│   ├── auth.js                - JWT verification
│   └── uploadAnimal.js        - Multer config
├── models/Animal.js           - Sequelize model
├── routes/
│   ├── index.js               - Route composition
│   ├── AnimalRoutes.js        - Animal endpoints
│   └── AuthRoutes.js          - Auth endpoints
├── seeders/demo-animals.js    - Demo data
├── uploads/animals/           - Photo storage
├── server.js                  - Express app
├── HOW_TO_RUN.md             - Setup guide
├── .env                       - Configuration
└── package.json              - Dependencies
```

## Features

✅ Full CRUD operations
✅ JWT authentication
✅ File upload handling (5MB max)
✅ Photo auto-cleanup on delete
✅ Ownership validation
✅ Error handling
✅ ENUM for animal types
✅ Boolean preferences (good with animals/children)
✅ Timestamp tracking
✅ Demo data seeding

## Environment Variables

```env

```

## Troubleshooting

**Port already in use:**
```bash
PORT=3001 npm start
```

**Database connection failed:**
- Verify MariaDB/MySQL is running on your configured `DB_HOST`
- Check .env credentials

**No seeders yet:**
```bash
node seeders/demo-animals.js
```

**Test database:**
```bash
node test-db-connection.js
```

## Development Notes

- SQL logging: Set `NODE_ENV=development` to see queries
- Token expires: 7 days
- File upload: JPEG, PNG, GIF, WebP (5MB max)
- Photos stored: `uploads/animals/`
- Timestamps: Auto-managed by Sequelize

## See Also

- `HOW_TO_RUN.md` - Setup instructions
