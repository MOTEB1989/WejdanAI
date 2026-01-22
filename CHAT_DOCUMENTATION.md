# Chat Feature Documentation

## Overview

A modern, real-time chat component built with Nuxt 3, Tailwind CSS, and WebSockets. Features include real-time messaging, typing indicators, message persistence, and a beautiful glassmorphism UI design.

## Features

### 🎨 UI Components
- **ChatMessage.vue**: Individual message bubble component with avatar and timestamp
- **ChatInput.vue**: Message input field with send button and typing indicators
- **Chat.vue**: Main chat container with message history and WebSocket integration

### 🔄 Real-time Features
- WebSocket-based real-time messaging
- Typing indicators
- Connection status indicator
- Auto-scroll to latest messages
- Message delivery status

### 💾 Database Integration
- Automatic table creation on first use
- Message persistence with PostgreSQL
- Message history loading with pagination support

### 📱 Responsive Design
- Mobile-first responsive layout
- Glassmorphism design matching existing UI
- Dark mode support
- Custom scrollbar styling

## Architecture

### Backend API Endpoints

#### GET `/api/chat/messages`
Retrieves message history from the database.

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve (default: 50)

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "user_id": 1,
      "message": "Hello!",
      "timestamp": "2026-01-22T00:00:00Z",
      "sender_name": "John Doe",
      "sender_image": "https://..."
    }
  ],
  "count": 1
}
```

#### POST `/api/chat/messages`
Saves a new message to the database.

**Request Body:**
```json
{
  "message": "Hello!",
  "sender_name": "John Doe",
  "sender_image": "https://...",
  "user_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": 1,
    "user_id": 1,
    "message": "Hello!",
    "timestamp": "2026-01-22T00:00:00Z",
    "sender_name": "John Doe",
    "sender_image": "https://..."
  }
}
```

### WebSocket Protocol

WebSocket endpoint: `ws://localhost:3000/api/chat/ws` (or `wss://` for HTTPS)

#### Message Types

**New Message:**
```json
{
  "type": "message",
  "message": {
    "id": 1,
    "user_id": 1,
    "message": "Hello!",
    "timestamp": "2026-01-22T00:00:00Z",
    "sender_name": "John Doe",
    "sender_image": "https://..."
  }
}
```

**Typing Indicator:**
```json
{
  "type": "typing",
  "sender_name": "John Doe"
}
```

## Database Schema

### Messages Table

```sql
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sender_name VARCHAR(255) NOT NULL,
  sender_image VARCHAR(255)
);
```

The table is automatically created when the first message API call is made.

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
POSTGRES_URL=postgres://username:password@host:port/database
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Chat

Navigate to `http://localhost:3000/chat`

## Usage

### Adding Chat to a Page

```vue
<template>
  <Chat :current-user="currentUser" />
</template>

<script setup>
const currentUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://...'
}
</script>
```

### Customizing Components

The chat components use Tailwind CSS classes and can be easily customized:

- **Colors**: Modify the `bg-blue-500` classes for different color schemes
- **Spacing**: Adjust padding and margin classes
- **Typography**: Change text size and weight classes

## Technical Details

### WebSocket Implementation

The WebSocket server is implemented as a Nuxt server plugin (`/server/plugins/websocket.ts`) that:
- Initializes when the HTTP server starts
- Handles upgrade requests to WebSocket protocol
- Broadcasts messages to all connected clients
- Manages client connections and disconnections

### State Management

Uses Vue 3 Composition API with reactive state:
- `messages`: Array of chat messages
- `connectionStatus`: WebSocket connection state
- `typingUsers`: List of users currently typing
- Auto-cleanup on component unmount

### Message Formatting

- **Timestamps**: Uses the `ms` library for relative time formatting
- **Avatars**: Falls back to generated avatars if no image provided
- **Auto-scroll**: Automatically scrolls to new messages

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly message structure
- Focus management for input fields

## Browser Compatibility

- Modern browsers with WebSocket support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Messages are paginated (default 50 messages)
- WebSocket connections are reused
- Efficient database queries with indexes
- Lazy loading for message history

## Troubleshooting

### WebSocket Connection Issues

If WebSocket connection fails:
1. Check browser console for errors
2. Verify the server is running
3. Check firewall settings
4. For production, ensure WebSocket is supported by your hosting provider

### Database Connection Errors

If database errors occur:
1. Verify `POSTGRES_URL` environment variable is set
2. Check database credentials
3. Ensure database server is running
4. Check network connectivity to database

### Message Not Persisting

If messages aren't saved:
1. Check database connection
2. Verify API endpoints are accessible
3. Check browser console for API errors
4. Review server logs for errors

## Future Enhancements

Possible improvements:
- [ ] Message editing and deletion
- [ ] File/image sharing
- [ ] Emoji picker
- [ ] User presence indicators
- [ ] Read receipts
- [ ] Message search
- [ ] Multiple chat rooms
- [ ] Direct messaging
- [ ] Message reactions
- [ ] Voice messages

## License

MIT
