# WejdanAI Chat System

A comprehensive real-time chat system built with Nuxt 3, featuring beautiful glass morphism UI design and WebSocket support.

## Features

### Core Functionality
- ✅ Real-time message sending and receiving
- ✅ Message persistence (PostgreSQL + in-memory demo mode)
- ✅ Message history with pagination
- ✅ Typing indicators
- ✅ User presence tracking
- ✅ WebSocket with HTTP fallback

### User Interface
- ✅ Glass morphism design matching existing UI
- ✅ Responsive layout (mobile & desktop)
- ✅ Message bubbles with user avatars
- ✅ Timestamp formatting
- ✅ Character counter (2000 limit)
- ✅ Connection status indicator
- ✅ Auto-scrolling messages
- ✅ Smooth animations

## Quick Start

### Demo Mode (No Database Required)
The chat system works out of the box without a database:

```bash
npm install
npm run dev
```

Visit http://localhost:3000/chat to see the chat interface.

### Production Mode (With Database)
Set the `POSTGRES_URL` environment variable:

```bash
export POSTGRES_URL="your-postgresql-connection-string"
npm run dev
```

## Architecture

### Components
- **Chat.vue** - Main chat container with message list
- **ChatMessage.vue** - Individual message bubble
- **ChatInput.vue** - Message input with send button

### Composables
- **useWebSocket.ts** - WebSocket connection management with auto-reconnection

### API Endpoints
- `GET /api/messages` - Fetch message history (pagination support)
- `POST /api/messages` - Send new message
- `PUT /api/messages` - Edit message
- `DELETE /api/messages` - Delete message (soft delete)

### Database Schema
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  message_type VARCHAR(50) DEFAULT 'text',
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

## Configuration

### Environment Variables
- `POSTGRES_URL` - PostgreSQL connection string (optional, uses in-memory if not set)
- `ENABLE_WEBSOCKET` - Set to "true" to enable WebSocket server (default: disabled)

### WebSocket Behavior
- **Development:** Disabled by default, uses HTTP fallback
- **Production:** Disabled by default for serverless compatibility
- **Enable:** Set `ENABLE_WEBSOCKET=true` for true real-time updates

## Usage

### Sending Messages
1. Navigate to `/chat`
2. Type your message in the input field
3. Press Enter or click the send button
4. Message appears immediately with timestamp

### Message Features
- **Enter** - Send message
- **Shift+Enter** - New line
- Character counter shows remaining characters
- Timestamps update dynamically (e.g., "2s ago", "5m ago")

## TypeScript Types

All chat-related types are defined in `types/chat.ts`:
- `User` - User profile
- `Message` - Chat message
- `WebSocketMessage` - WebSocket event
- `TypingIndicator` - Typing status
- `UserPresence` - Online/offline status
- `ChatState` - Global chat state

## Styling

The chat system uses:
- Tailwind CSS for utility classes
- Glass morphism effects (`backdrop-blur-lg`, `bg-white/30`)
- Consistent with existing UI components
- Responsive breakpoints
- Dark mode support

## Demo Mode

When no database is available:
- Messages stored in-memory
- Demo user automatically logged in
- Perfect for testing and development
- All features fully functional

## Production Deployment

### Vercel (Recommended)
The chat system is optimized for serverless deployment:

1. Set environment variables in Vercel dashboard
2. WebSocket disabled by default (uses HTTP API)
3. Database connection via `POSTGRES_URL`
4. Deploy normally - chat works immediately

### Traditional Server
For non-serverless deployments:

1. Set `ENABLE_WEBSOCKET=true`
2. WebSocket server will initialize
3. True real-time updates enabled
4. Requires persistent server process

## Testing

The implementation has been tested for:
- ✅ Message sending/receiving
- ✅ Message persistence
- ✅ UI responsiveness
- ✅ TypeScript type safety
- ✅ Build process
- ✅ Security (CodeQL verified)

## Future Enhancements

Optional features for future development:
- Message editing UI
- Emoji picker
- File/image sharing
- User mentions (@username)
- Message search
- Message reactions
- Threaded conversations

## License

MIT
