# WejdanAI Chat System Documentation

## Overview

The WejdanAI Chat System is a full-featured, real-time messaging application built with Nuxt 3, PostgreSQL, and WebSockets. It provides a modern chat interface with real-time message delivery, typing indicators, and persistent message storage.

## Features

### Core Features
- ✅ Real-time message delivery via WebSockets
- ✅ Message persistence in PostgreSQL database
- ✅ Typing indicators
- ✅ Connection status display
- ✅ Auto-scroll to latest messages
- ✅ Message timestamps with smart formatting
- ✅ User avatars and identifiers
- ✅ Automatic reconnection on connection loss
- ✅ Responsive design (mobile & desktop)

### Design Features
- Glass morphism UI with backdrop blur effects
- Dark/light theme support
- Gradient text and button styling
- Message bubbles with different styles for sent/received messages
- Smooth animations and transitions
- Consistent with existing WejdanAI design system

## Architecture

### Frontend Components

#### 1. **Chat.vue** - Main Chat Container
Located: `/components/Chat.vue`

The main chat interface component that orchestrates all chat functionality.

**Props:**
- `currentUser` - Object containing user information (id, name, image)

**Features:**
- Message history loading from API
- WebSocket connection management
- Real-time message display
- Auto-scrolling functionality
- Connection status indicator
- Empty state handling

**Usage:**
```vue
<Chat :current-user="{ id: 1, name: 'John Doe', image: 'https://...' }" />
```

#### 2. **ChatMessage.vue** - Message Bubble Component
Located: `/components/ChatMessage.vue`

Displays individual chat messages with appropriate styling.

**Props:**
- `message` - Message object containing userId, userName, content, timestamp
- `currentUserId` - ID of the current user (to determine message direction)

**Features:**
- Different bubble styles for sent vs received messages
- User avatar display (or initials if no image)
- Smart timestamp formatting (relative time)
- Text wrapping and link preservation

#### 3. **ChatInput.vue** - Message Input Component
Located: `/components/ChatInput.vue`

Handles message composition and sending.

**Props:**
- `typingUsers` - Map of users currently typing
- `isSending` - Boolean indicating if a message is being sent
- `maxLength` - Maximum message length (default: 1000)

**Events:**
- `@send` - Emitted when user sends a message
- `@typing` - Emitted when user starts/stops typing

**Features:**
- Auto-resizing textarea
- Character counter (shown at 80% of limit)
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Typing indicator display
- Send button with loading state

### Backend Components

#### 4. **WebSocket Server**
Located: `/server/api/websocket.ts`

Real-time communication server using Nitro's experimental WebSocket support.

**Message Types:**
- `identify` - Client identifies with user information
- `message` - Broadcast chat message to all clients
- `typing` - Broadcast typing indicator
- `ping/pong` - Heartbeat to keep connection alive
- `user_joined/user_left` - User presence notifications

**Features:**
- Client connection management
- Message broadcasting
- Typing indicator handling
- Automatic cleanup on disconnect

#### 5. **API Endpoints**

##### GET `/api/messages`
Retrieve message history with pagination.

**Query Parameters:**
- `limit` - Number of messages to retrieve (default: 50)
- `offset` - Offset for pagination (default: 0)

**Response:**
```json
{
  "messages": [...],
  "duration": 123,
  "count": 50
}
```

##### POST `/api/messages`
Send a new message and persist to database.

**Request Body:**
```json
{
  "user_id": 1,
  "user_name": "John Doe",
  "user_image": "https://...",
  "content": "Hello world!",
  "message_type": "text"
}
```

**Response:**
```json
{
  "message": { "id": 123, ... },
  "duration": 45
}
```

##### GET `/api/messages/recent`
Get recent messages (last 20) or messages since a timestamp.

**Query Parameters:**
- `since` - ISO timestamp (optional)

**Response:**
```json
{
  "messages": [...],
  "duration": 78,
  "count": 20
}
```

### Composables

#### useWebSocket
Located: `/composables/useWebSocket.ts`

Manages WebSocket connection lifecycle and message handling.

**Exported Values:**
- `ws` - WebSocket instance reference
- `isConnected` - Connection status boolean
- `messages` - Array of real-time messages
- `typingUsers` - Map of users currently typing

**Methods:**
- `connect(userId, userName, userImage)` - Establish WebSocket connection
- `disconnect()` - Close WebSocket connection
- `sendMessage(message)` - Send chat message via WebSocket
- `sendTypingIndicator(userId, userName, isTyping)` - Send typing status

**Features:**
- Automatic reconnection (up to 5 attempts with exponential backoff)
- Heartbeat mechanism to keep connection alive
- Message queueing for offline scenarios
- Proper cleanup on component unmount

## Database Schema

### Messages Table

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_image VARCHAR(255),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Unique message identifier
- `user_id` - ID of the user who sent the message
- `user_name` - Display name of the user
- `user_image` - URL to user's avatar image (optional)
- `content` - Message text content
- `message_type` - Type of message (text, system, etc.)
- `created_at` - Timestamp when message was created
- `updated_at` - Timestamp when message was last updated

## Pages

### Chat Page
Located: `/pages/chat.vue`

Full-screen chat interface accessible at `/chat`.

**Features:**
- SEO-optimized with meta tags
- Responsive layout
- User selection from existing users
- Navigation back to home page

## Configuration

### Nuxt Configuration
The chat system requires experimental WebSocket support in Nitro:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    experimental: {
      websocket: true
    }
  }
})
```

### Environment Variables

Required for production deployment:
- `POSTGRES_URL` - PostgreSQL connection string with SSL

Example:
```
POSTGRES_URL=postgres://user:password@host:5432/database?ssl=true
```

## Usage Guide

### Setting Up the Chat System

1. **Install Dependencies:**
```bash
npm install
```

2. **Configure Database:**
Set the `POSTGRES_URL` environment variable with your PostgreSQL connection string.

3. **Run Development Server:**
```bash
npm run dev
```

4. **Access Chat:**
Navigate to `http://localhost:3000/chat`

### Sending Messages

1. Type your message in the input field
2. Press **Enter** to send (or click the Send button)
3. Press **Shift+Enter** to add a new line without sending

### Typing Indicators

The chat automatically shows typing indicators:
- Start typing to trigger your typing indicator for other users
- Other users' typing indicators appear below the input field
- Typing indicators automatically clear after 2 seconds of inactivity

### Connection Status

The connection status indicator in the header shows:
- 🟢 **Connected** - WebSocket is active
- 🔴 **Disconnected** - Connection lost (will auto-retry)

## Customization

### Styling

The chat system uses Tailwind CSS and follows these design patterns:

**Glass Morphism:**
```css
bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5
```

**Gradient Text:**
```css
bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-transparent
```

**Message Bubbles:**
- Sent: `bg-gradient-to-br from-blue-500 to-purple-600 text-white`
- Received: `bg-white/30 dark:bg-white/10 backdrop-blur-lg`

### Adding New Message Types

1. Update the `message_type` field in the database
2. Add handling in `ChatMessage.vue` for the new type
3. Update the `sendMessage` function to support the new type

### Extending WebSocket Messages

Add new message types in `/server/api/websocket.ts`:

```typescript
case 'custom_type':
  // Handle custom message type
  broadcast({
    type: 'custom_type',
    data: message.data
  })
  break
```

## Performance Considerations

### Message Pagination
- Default limit: 50 messages per page
- Implement virtual scrolling for large histories
- Use `offset` parameter for loading older messages

### WebSocket Optimization
- Heartbeat every 25 seconds to keep connections alive
- Automatic cleanup of stale connections (30-second timeout)
- Efficient message broadcasting to connected clients only

### Caching Strategy
- Historical messages cached in component state
- Real-time messages appended to existing history
- Duplicate detection based on timestamp and content

## Troubleshooting

### WebSocket Connection Issues

**Problem:** WebSocket fails to connect
**Solution:** 
- Ensure experimental WebSocket is enabled in `nuxt.config.ts`
- Check browser console for connection errors
- Verify firewall/proxy settings allow WebSocket connections

### Database Connection Errors

**Problem:** `ECONNREFUSED` when accessing API
**Solution:**
- Verify `POSTGRES_URL` environment variable is set
- Ensure PostgreSQL server is running and accessible
- Check SSL requirements (use `?ssl=true` in connection string)

### Messages Not Persisting

**Problem:** Messages sent but not saved to database
**Solution:**
- Check server logs for database errors
- Verify messages table exists (will auto-create on first use)
- Ensure user_id and user_name are being sent correctly

## Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup

1. Set `POSTGRES_URL` environment variable
2. Ensure WebSocket connections are supported by your hosting provider
3. Configure SSL/TLS for secure WebSocket connections (wss://)

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Test WebSocket connectivity
- [ ] Verify SSL/TLS configuration
- [ ] Test message persistence
- [ ] Monitor connection stability
- [ ] Set up error logging

## Security Considerations

### Input Validation
- Message content is sanitized before storage
- Maximum message length enforced (1000 characters)
- User IDs validated against authenticated users

### WebSocket Security
- Client identification required before message broadcasting
- No sensitive data exposed in WebSocket messages
- Connection cleanup prevents memory leaks

### Database Security
- Parameterized queries prevent SQL injection
- SSL required for database connections
- User data access controlled by authentication

## Future Enhancements

Potential features for future development:

- [ ] Message editing and deletion
- [ ] File attachments and image sharing
- [ ] Emoji reactions to messages
- [ ] Message threading and replies
- [ ] User presence indicators (online/offline/away)
- [ ] Message search functionality
- [ ] Private messaging between users
- [ ] Message notifications
- [ ] Read receipts
- [ ] Voice messages
- [ ] Video chat integration

## Support

For issues or questions:
1. Check this documentation
2. Review server logs for errors
3. Check browser console for client-side errors
4. Verify database connectivity
5. Test WebSocket connection separately

## License

This chat system is part of the WejdanAI project and follows the same licensing terms.
