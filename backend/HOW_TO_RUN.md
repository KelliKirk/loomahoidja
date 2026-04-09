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

Load 5 demo animals into the database:
```bash
node seeders/demo-animals.js
```

This adds test data for testing CRUD operations.

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
