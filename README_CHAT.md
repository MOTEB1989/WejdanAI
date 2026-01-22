# WejdanAI - Real-time Chat Application

## Overview
This is a Nuxt 3 application with PostgreSQL and real-time chat capabilities using WebSockets.

## Features Implemented

### ✅ Real-time Chat System
- WebSocket-powered real-time messaging
- Typing indicators
- Online user count
- Auto-reconnection on connection loss
- Message history with timestamps
- User avatars and names
- Responsive design with dark/light theme support

### ✅ Database Integration
- PostgreSQL database schema for messages
- CRUD API endpoints for messages
- User profiles integration
- Message persistence

### ✅ Modern UI Components
- Chat component with scrollable message area
- ChatMessage component with user avatars
- ChatInput with auto-resize textarea
- TypingIndicator with animated dots
- Consistent design with Tailwind CSS
- Mobile-friendly responsive layout

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (optional for demo)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (required for database)
# Create a .env file with:
POSTGRES_URL=your_postgres_connection_string

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

The application requires the following environment variable for full functionality:

- `POSTGRES_URL`: PostgreSQL connection string (e.g., `postgres://user:pass@host:5432/db?ssl=require`)

**Note**: Without a database connection, the application will display a connection error but the UI and WebSocket functionality can still be demonstrated.

## API Endpoints

### Messages API
- `GET /api/messages` - Retrieve message history (with pagination)
- `POST /api/messages` - Create a new message
- `GET /api/messages/[id]` - Get specific message
- `PUT /api/messages/[id]` - Update message
- `DELETE /api/messages/[id]` - Delete message

### WebSocket API
- `ws://localhost:3000/api/websocket` - WebSocket endpoint for real-time communication

#### WebSocket Events
**Client → Server:**
- `message:send` - Send a new message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:identify` - Identify user with name

**Server → Client:**
- `connection` - Welcome message with client ID
- `message:broadcast` - New message from any user
- `typing:broadcast` - Typing indicator from other users
- `user:online` - Online user count update

## Project Structure

```
├── components/
│   ├── Chat.vue              # Main chat component
│   ├── ChatMessage.vue       # Individual message bubble
│   ├── ChatInput.vue         # Message input field
│   ├── TypingIndicator.vue   # Typing animation
│   └── Table.vue             # User list component
├── pages/
│   ├── index.vue             # Home page with user list
│   └── chat.vue              # Chat page
├── server/
│   └── api/
│       ├── get-users.ts      # User list endpoint
│       ├── websocket.ts      # WebSocket server
│       └── messages/         # Message CRUD endpoints
│           ├── index.get.ts
│           ├── index.post.ts
│           ├── [id].get.ts
│           ├── [id].put.ts
│           └── [id].delete.ts
└── assets/
    └── css/
        └── main.css          # Tailwind CSS imports
```

## Technologies Used

- **Framework**: Nuxt 3
- **Database**: PostgreSQL with `postgres` driver
- **Real-time**: WebSocket (ws package)
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **UI**: Vue 3 Composition API

## Database Schema

### Messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  image VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Features in Detail

### Chat Component
- Real-time message synchronization
- Auto-scroll to latest messages
- Connection status indicator
- Reconnection button
- Loading states
- Error handling

### Message Display
- Different styles for sent/received messages
- User avatars next to messages
- Timestamps with relative time
- Message bubbles with rounded corners
- Support for multi-line messages

### Typing Indicators
- Shows when other users are typing
- Animated dots
- Multiple user support
- Auto-hide after inactivity

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly controls
- Optimized for both portrait and landscape

## Demo Mode

The application can run in demo mode without a database connection. In this mode:
- The UI and layout are fully functional
- WebSocket connections are established
- Messages can be sent between connected clients
- Typing indicators work in real-time
- Message history will show an empty state

## Deployment

### Vercel
The application is optimized for deployment on Vercel:

1. Add `POSTGRES_URL` environment variable in Vercel dashboard
2. Deploy from Git repository
3. Application will automatically build and deploy

### Other Platforms
The application can be deployed to any Node.js hosting platform that supports:
- Node.js 18+
- WebSocket connections
- PostgreSQL database access

## License
MIT
