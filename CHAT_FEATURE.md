# WejdanAI Chat Feature

## Overview
This document describes the real-time chat feature implementation for the WejdanAI Nuxt 3 application.

## Components Created

### 1. Chat Components (`/components/`)

#### `Chat.vue` - Main Chat Component
The orchestrator component that manages the entire chat interface:
- **Features**:
  - Message history loading from API
  - Real-time message display
  - Connection status indicator
  - Auto-scroll to latest messages
  - Scroll-to-bottom button
  - Loading states
  - Empty state UI
  - Current user badge in header

#### `ChatMessage.vue` - Message Bubble Component
Individual message display with styling:
- **Features**:
  - Different styles for sent vs received messages
  - User avatars with fallback initials
  - Timestamps with "time ago" format
  - Gradient avatars for users without images
  - Proper text wrapping and responsive sizing
  - Matches existing design system (backdrop blur, rings)

#### `ChatInput.vue` - Message Input Component
Message composition interface:
- **Features**:
  - Auto-expanding textarea
  - Enter to send, Shift+Enter for new line
  - Send button with gradient styling
  - Typing indicators display
  - Loading state during message sending
  - Disabled state when disconnected
  - Character limit support

#### `ChatUserList.vue` - Online Users Sidebar
Displays online users in the chat:
- **Features**:
  - User list with avatars
  - Online/offline status indicators
  - Typing indicators per user
  - Scrollable list for many users
  - Empty state when no users
  - Responsive design (hidden on mobile, visible on desktop)

## Pages Created

### `/pages/chat.vue` - Chat Page
Full chat interface page:
- **Features**:
  - Responsive grid layout (sidebar + chat area)
  - User initialization from API
  - Navigation links to home and GitHub
  - Gradient background matching existing design
  - Desktop: Shows user list sidebar and chat
  - Mobile: Full-width chat only

## API Endpoints

### `GET /api/messages` - Fetch Message History
**Location**: `/server/api/messages/index.get.ts`
- **Query Parameters**:
  - `limit` (default: 50) - Number of messages to fetch
  - `offset` (default: 0) - Pagination offset
- **Response**:
  ```json
  {
    "messages": [...],
    "count": 50
  }
  ```
- **Features**:
  - Auto-creates messages table if it doesn't exist
  - Joins with profiles table for user information
  - Returns messages in chronological order (oldest first)
  - Error handling for database issues

### `POST /api/messages` - Send New Message
**Location**: `/server/api/messages/index.post.ts`
- **Request Body**:
  ```json
  {
    "user_id": 1,
    "content": "Hello, world!",
    "message_type": "text"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": {
      "id": 123,
      "user_id": 1,
      "content": "Hello, world!",
      "created_at": "2026-01-22T01:00:00Z",
      "message_type": "text",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "user_image": "https://..."
    }
  }
  ```
- **Features**:
  - Validates required fields
  - Fetches user details after creating message
  - Returns complete message object with user info
  - Error handling with appropriate status codes

## Database Schema

### Messages Table
```sql
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  message_type VARCHAR(50) DEFAULT 'text'
);
```

The table is automatically created when the GET endpoint is first called if it doesn't exist.

## Composables

### `useWebSocket.ts` - WebSocket Management
**Location**: `/composables/useWebSocket.ts`
- **Features**:
  - WebSocket connection management
  - Auto-reconnection on disconnect
  - Message parsing and queuing
  - Error handling
  - Cleanup on component unmount
- **Usage**:
  ```typescript
  const { connect, send, disconnect, isConnected, messages, error } = useWebSocket('ws://localhost:3000/ws')
  connect()
  send({ type: 'message', content: 'Hello!' })
  ```

## Design System Integration

All components follow the existing design patterns:
- **Colors**: Matching gradient styles (blue-500 to blue-600 for primary actions)
- **Backdrop Effects**: Using `backdrop-blur-lg` with white/10 transparency
- **Rings**: Consistent `ring-1 ring-gray-900/5` for borders
- **Dark Mode**: Full dark/light theme support
- **Typography**: Matching font sizes and weights
- **Spacing**: Consistent padding and margins
- **Shadows**: Matching shadow-lg and shadow-xl patterns

## Features Implemented

### ✅ Completed
1. Message display with proper styling
2. Message history loading
3. Message sending via API
4. Auto-scroll to latest messages
5. Scroll-to-bottom button
6. Connection status indicator
7. Loading states
8. Empty states
9. User avatars and identification
10. Timestamps with relative time
11. Responsive design (mobile & desktop)
12. Dark/light theme support
13. Error handling
14. Database persistence
15. User list sidebar
16. Gradient backgrounds and effects

### 🔄 Pending (Future Enhancements)
These features were prepared but require additional setup:
1. **Real-time WebSocket messaging** - WebSocket composable created but needs server-side WebSocket implementation
2. **Typing indicators** - UI prepared but needs WebSocket events
3. **Online/offline status** - UI prepared but needs WebSocket presence
4. **Message reactions** - Can be added with additional API endpoints
5. **File/image sharing** - Can be added with upload endpoints
6. **Message search** - Can be added with search API
7. **Chat rooms/channels** - Can be added with room management

## How to Use

### 1. Set up PostgreSQL connection
Ensure `POSTGRES_URL` environment variable is set:
```bash
export POSTGRES_URL="postgresql://user:password@host:5432/database"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

### 4. Access the chat
Navigate to `http://localhost:3000/chat`

### 5. Build for production
```bash
npm run build
npm run preview
```

## Navigation

- **Home Page** (`/`): Added "Go to Chat Room →" button
- **Chat Page** (`/chat`): Full chat interface
- **Back to Home**: Link in chat page footer

## Technical Details

### Message Flow
1. User types message in ChatInput
2. On send, POST request to `/api/messages`
3. Message saved to PostgreSQL database
4. Message added to local state
5. Auto-scroll to show new message
6. (Future) WebSocket broadcast to other users

### Data Flow
```
User Input → ChatInput → Chat.vue → API (/api/messages POST)
                                   ↓
                              PostgreSQL
                                   ↓
API (/api/messages GET) → Chat.vue → ChatMessage (display)
```

### Styling Approach
- TailwindCSS utility classes
- Gradient backgrounds for visual appeal
- Backdrop blur effects for glassmorphism
- Ring borders for subtle depth
- Consistent color palette
- Responsive breakpoints (lg:)

## Browser Compatibility
- Modern browsers with ES2020+ support
- WebSocket support for real-time features
- Flexbox and Grid layout support
- CSS backdrop-filter support

## Performance Considerations
- Message pagination (50 messages per load)
- Auto-scroll only when at bottom
- Efficient re-rendering with Vue 3 reactivity
- Lazy loading for user avatars
- Minimal DOM updates

## Security
- PostgreSQL parameterized queries (SQL injection protection)
- User ID validation on message creation
- HTTPS required for production WebSocket
- CORS configuration needed for production

## Accessibility
- Semantic HTML structure
- Keyboard navigation support (Enter to send)
- Focus states on interactive elements
- Alt text on images
- ARIA labels where needed

## Future Improvements
1. Add WebSocket server for true real-time messaging
2. Implement typing indicators with WebSocket events
3. Add presence system for online/offline status
4. Implement message read receipts
5. Add file upload capability
6. Add emoji picker
7. Implement message editing and deletion
8. Add user mentions (@username)
9. Implement message search
10. Add chat rooms/channels
11. Add message notifications
12. Implement message reactions

## Testing
To test the chat functionality:
1. Open chat page in browser
2. Send a message (it will be saved to database)
3. Refresh page to see message history loading
4. Open in multiple tabs to simulate multiple users (manual refresh needed)
5. Test responsive design by resizing browser window

## Troubleshooting

### Messages not loading
- Check PostgreSQL connection
- Verify POSTGRES_URL environment variable
- Check server logs for errors

### Messages not sending
- Check browser console for errors
- Verify user_id is valid
- Check database connection

### Styling issues
- Clear browser cache
- Rebuild Nuxt: `npm run build`
- Check Tailwind compilation

## License
MIT

## Contributors
Built for WejdanAI by GitHub Copilot
