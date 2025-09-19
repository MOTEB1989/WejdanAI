# WejdanAI JWT Authentication and Models API

This project has been enhanced with JWT authentication and a models management API.

## New Features

### 1. JWT Authentication System

- **Location**: `server/utils/auth.ts`
- **Functions**:
  - `generateToken(payload, expiresIn)`: Creates JWT tokens
  - `verifyToken(token)`: Validates JWT tokens

### 2. Authentication Endpoint

- **Endpoint**: `POST /api/auth`
- **Purpose**: Generate JWT tokens for authentication
- **Request body**: `{ "username": "your_username" }`
- **Response**: `{ "message": "Token generated successfully", "token": "...", "username": "..." }`

### 3. Models Management API

- **Endpoint**: `/api/models`
- **Methods**: GET, POST
- **Authentication**: Required (JWT token in Authorization header)

#### GET /api/models
- **Purpose**: Retrieve all models
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of models

#### POST /api/models
- **Purpose**: Add a new model
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request body**: 
  ```json
  {
    "name": "Model Name",
    "version": "1.0",
    "description": "Optional description"
  }
  ```

### 4. Database Schema

The following SQL schema is included in `database-schema.sql`:

```sql
-- Models table
CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Link logs to models (if logs table exists)
ALTER TABLE logs ADD COLUMN model_id INT REFERENCES models(id) ON DELETE SET NULL;
```

## Usage Examples

### 1. Generate JWT Token

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"myuser"}'
```

### 2. Add a Model

```bash
curl -X POST http://localhost:3000/api/models \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"GPT-4","version":"4.0","description":"OpenAI model"}'
```

### 3. Get All Models

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/models
```

### 4. Python Example

```python
import requests

BASE_URL = "http://localhost:3000"

# Get token
auth_response = requests.post(f"{BASE_URL}/api/auth", 
    json={"username": "testuser"})
token = auth_response.json()["token"]

# Add model
requests.post(f"{BASE_URL}/api/models",
    headers={"Authorization": f"Bearer {token}"},
    json={"name": "GPT-4", "version": "4.0", "description": "OpenAI model"})

# Get models
models = requests.get(f"{BASE_URL}/api/models", 
    headers={"Authorization": f"Bearer {token}"}).json()
```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT signing (defaults to "dev-secret")
- `POSTGRES_URL`: PostgreSQL connection string (required for production)

## Demo Files

- `test-api.js`: Node.js test script
- `test-api.py`: Python test script
- `models-demo.ts`: Demo endpoint with in-memory storage (for testing without database)
- `database-schema.sql`: Database migration script

## Security Features

- JWT tokens expire after 1 hour by default
- All protected endpoints require valid Authorization header
- Invalid or expired tokens return 401 Unauthorized
- Tokens are signed with configurable secret key

## Development

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Test endpoints using the provided scripts

## Database Setup

1. Set up PostgreSQL database
2. Configure `POSTGRES_URL` environment variable  
3. Run the SQL migration in `database-schema.sql`
4. Replace `models-demo.ts` usage with `models.ts` for database integration