# Chat Feature Documentation

## Overview

The WejdanAI Chat component provides a real-time messaging system with WebSocket support, integrated seamlessly with the existing Nuxt 3 + PostgreSQL + Tailwind CSS architecture.

## Features

### Core Functionality
- ✅ Real-time messaging with WebSocket
- ✅ Message persistence in PostgreSQL
- ✅ Typing indicators
- ✅ Online user count
- ✅ Auto-reconnection on disconnect
- ✅ Responsive design (mobile & desktop)
- ✅ Glass morphism design consistent with app theme
- ✅ Dark/light theme support

### Components

#### 1. Chat.vue
Main chat interface component that manages:
- Message display with auto-scrolling
- WebSocket connection management
- Real-time message broadcasting
- Connection status indicator
- User presence tracking

**Props:**
- `currentUser` (User): The current logged-in user object

**Features:**
- Loads message history on mount
- Establishes WebSocket connection
- Handles message sending and receiving
- Displays typing indicators
- Auto-reconnects on connection loss

#### 2. ChatMessage.vue
Individual message bubble component with:
- Different styles for sent vs received messages
- User avatar display
- Timestamp formatting using `ms` library
- Smooth fade-in animations

**Props:**
- `message` (Message): Message object to display
- `currentUserId` (number): Current user's ID to determine message alignment

#### 3. ChatInput.vue
Message input component featuring:
- Auto-resizing textarea
- Character limit (1000 chars default)
- Send on Enter (Shift+Enter for new line)
- Typing indicator broadcasting
- Send button with icon

**Props:**
- `disabled` (boolean): Disables input when disconnected
- `maxLength` (number): Maximum character limit (default: 1000)

**Events:**
- `send`: Emitted when user sends a message
- `typing`: Emitted when user is typing

### API Endpoints

#### GET /api/messages
Retrieves message history with pagination.

**Query Parameters:**
- `limit` (number, default: 50): Number of messages to retrieve
- `offset` (number, default: 0): Offset for pagination

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "user_image": "https://...",
      "content": "Hello!",
      "type": "text",
      "created_at": "2024-01-22T10:30:00Z",
      "updated_at": "2024-01-22T10:30:00Z"
    }
  ],
  "total": 50
}
```

#### POST /api/messages
Creates a new message.

**Request Body:**
```json
{
  "user_id": 1,
  "user_name": "John Doe",
  "user_image": "https://...",
  "content": "Hello, world!",
  "type": "text"
}
```

**Response:**
Returns the created message object.

#### GET /api/chat-users
Retrieves list of registered users.

**Response:**
```json
{
  "users": [...],
  "count": 3
}
```

### Database Schema

#### messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_image VARCHAR(255),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

The table is automatically created when first accessed if it doesn't exist.

### WebSocket Server

#### Implementation
Located in `server/plugins/websocket.ts`, the WebSocket server handles:
- Client connection management
- Message broadcasting
- User presence tracking
- Typing indicator broadcasting

#### Message Types

**Client → Server:**
1. `user_connected`: Sent when user connects
   ```json
   {
     "type": "user_connected",
     "user": { "id": 1, "name": "John Doe" }
   }
   ```

2. `send_message`: Send a new message
   ```json
   {
     "type": "send_message",
     "message": { /* message object */ }
   }
   ```

3. `typing`: User is typing
   ```json
   {
     "type": "typing",
     "userId": 1,
     "userName": "John Doe"
   }
   ```

**Server → Client:**
1. `users_count`: Updated online user count
   ```json
   {
     "type": "users_count",
     "count": 5
   }
   ```

2. `new_message`: New message broadcast
   ```json
   {
     "type": "new_message",
     "message": { /* message object */ }
   }
   ```

3. `user_typing`: Someone is typing
   ```json
   {
     "type": "user_typing",
     "userId": 2,
     "userName": "Jane Smith"
   }
   ```

## Usage

### Accessing the Chat
1. Navigate to the home page (`/`)
2. Click the "Open Chat →" button
3. Or directly navigate to `/chat`

### Sending Messages
1. Type your message in the input field at the bottom
2. Press Enter or click the send button
3. Messages appear instantly for all connected users

### Design Consistency
The chat interface maintains the existing app design:
- Glass morphism effects (`backdrop-blur-lg`, `ring-1 ring-gray-900/5`)
- Gradient text effects
- Consistent spacing and typography
- Dark/light theme support

## Technical Details

### TypeScript Support
All components and API endpoints are fully typed:
```typescript
interface Message {
  id: number
  user_id: number
  user_name: string
  user_image?: string
  content: string
  type: string
  created_at: string
}

interface User {
  id: number
  name: string
  email: string
  image?: string
}
```

### Error Handling
- Failed message sends show in console (can be extended to show user notifications)
- WebSocket auto-reconnects on disconnect (3-second delay)
- Database errors gracefully handled with table auto-creation
- Input validation for required fields

### Performance Optimizations
- Optimistic UI updates (messages appear immediately)
- Message virtualization ready (currently loads 50 recent messages)
- Efficient WebSocket connection sharing
- Auto-scrolling to bottom on new messages

## Development

### Running Locally
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

### Environment Variables
The application requires `POSTGRES_URL` environment variable for database connection:
```
POSTGRES_URL=postgresql://user:password@host:port/database
```

## Future Enhancements

Potential improvements that could be added:
- [ ] User authentication integration
- [ ] File/image sharing
- [ ] Message reactions (emoji)
- [ ] Message editing and deletion
- [ ] Read receipts
- [ ] Private messaging (DMs)
- [ ] Message search functionality
- [ ] Infinite scroll for message history
- [ ] Rich text formatting
- [ ] Notification sounds
- [ ] Desktop notifications

## Browser Support
- Modern browsers with WebSocket support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes
- For demo purposes, the app uses the first user from the profiles table as the current user
- In production, integrate with your authentication system
- WebSocket connections work in both development and production
- Messages are persisted indefinitely (consider adding cleanup/archiving for production)
