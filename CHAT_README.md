# WejdanAI Chat Feature

## Overview
This chat system provides real-time messaging capabilities for the WejdanAI application, built with Nuxt 3, PostgreSQL, and WebSockets.

## Features Implemented

### ✅ Core Components
- **Chat.vue** - Main chat interface with connection status, message list, and user info
- **ChatMessage.vue** - Individual message bubbles with timestamps and avatars
- **ChatInput.vue** - Message input field with typing detection and send button

### ✅ Backend API
- **GET /api/messages** - Retrieve message history with pagination support
- **POST /api/messages** - Send new messages to the database
- **WebSocket /api/ws** - Real-time message broadcasting (requires proper server setup)

### ✅ Database Schema
```sql
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_name VARCHAR(255) NOT NULL,
  user_image VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  message_type VARCHAR(50) DEFAULT 'text'
);
```

### ✅ Design Features
- Consistent styling with existing application (backdrop blur, gradients, ring effects)
- Dark/Light theme support
- Responsive design
- Message bubbles differentiated for sent vs received
- Relative timestamps using `ms` package
- Auto-scroll to latest messages
- Typing indicators
- Connection status indicator

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with your PostgreSQL connection string:

```env
POSTGRES_URL=postgresql://username:password@hostname:port/database?sslmode=require
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
The messages table will be automatically created when you first access the `/api/messages` endpoint.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access Chat
Navigate to `http://localhost:3000` and click the "Open Chat" button, or go directly to `http://localhost:3000/chat`

## WebSocket Setup for Production

The WebSocket server requires special configuration in production. For Vercel deployment, consider using:
1. **Vercel KV** for pub/sub messaging
2. **Pusher** or **Ably** for managed WebSocket connections
3. **Socket.io** with proper adapter configuration

For traditional server deployments, the WebSocket implementation in `/server/api/ws.ts` will work when the server is initialized with the HTTP server instance.

## File Structure

```
├── components/
│   ├── Chat.vue              # Main chat container
│   ├── ChatMessage.vue       # Message bubble component
│   └── ChatInput.vue         # Input field component
├── pages/
│   └── chat.vue              # Chat page route
├── server/
│   └── api/
│       ├── messages.get.ts   # GET messages API
│       ├── messages.post.ts  # POST message API
│       └── ws.ts            # WebSocket endpoint
```

## Usage

### Sending Messages
1. Type your message in the input field at the bottom
2. Press Enter or click "Send"
3. Messages are saved to the database and broadcast via WebSocket

### Viewing Messages
- Messages load automatically when you open the chat
- Scroll through message history
- Your messages appear on the right (blue bubbles)
- Others' messages appear on the left (white/dark bubbles)

### Connection Status
- Green dot = Connected to WebSocket
- Red dot = Disconnected (attempting to reconnect)

## TypeScript Support
All components use TypeScript with proper type definitions for:
- Message interface
- User interface
- Component props
- Event emitters

## Styling
The chat interface uses:
- Tailwind CSS utility classes
- Consistent with existing design system
- Backdrop blur effects
- Gradient text for headings
- Responsive layout with flexbox

## Known Limitations

1. **WebSocket in Dev Mode**: Nuxt dev server doesn't fully support WebSockets. In production with a proper server, WebSocket will work correctly.

2. **User Authentication**: Currently uses a placeholder user. In production, integrate with your existing authentication system.

3. **Message Persistence**: All messages are stored in PostgreSQL. Consider implementing message retention policies for production.

4. **File Uploads**: Not yet implemented. Can be added as a future enhancement.

## Future Enhancements

- [ ] User authentication integration
- [ ] Online user list sidebar
- [ ] File/image sharing
- [ ] Message reactions
- [ ] Message editing and deletion
- [ ] Message search functionality
- [ ] Read receipts
- [ ] Push notifications
- [ ] Message threads/replies
- [ ] Emoji picker

## Troubleshooting

### Database Connection Errors
If you see `ECONNREFUSED` errors, ensure:
1. `POSTGRES_URL` is set in your `.env` file
2. The PostgreSQL server is running and accessible
3. The connection string is correct

### WebSocket Connection Failed
This is expected in Nuxt dev mode. The WebSocket will work in production when deployed with a proper server.

### Messages Not Appearing
1. Check browser console for errors
2. Verify database connection
3. Ensure the messages table exists
4. Check that the API endpoints are responding

## Contributing
When making changes to the chat system:
1. Follow existing TypeScript patterns
2. Maintain consistent styling with the rest of the application
3. Test on both desktop and mobile viewports
4. Ensure dark/light theme compatibility
