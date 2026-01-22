# WejdanAI Chat System - Quick Start Guide

## 🚀 Getting Started

The WejdanAI chat system is a production-ready, real-time messaging solution built with modern web technologies.

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (optional for local development)
- Environment variable `POSTGRES_URL` for database connection

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/MOTEB1989/WejdanAI.git
cd WejdanAI
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables (for production):**
```bash
# Create .env file
echo "POSTGRES_URL=your_postgres_connection_string" > .env
```

4. **Run development server:**
```bash
npm run dev
```

5. **Open chat interface:**
Navigate to `http://localhost:3000/chat`

## ✨ Features

### Real-Time Messaging
- Instant message delivery via WebSockets
- Automatic reconnection on connection loss
- Message persistence in PostgreSQL

### User Experience
- Typing indicators show when others are typing
- Connection status display
- Auto-scroll to latest messages
- Smart timestamp formatting
- Character counter for long messages

### Design
- Glass morphism UI with backdrop blur
- Dark/light theme support
- Responsive mobile and desktop layouts
- Gradient styling consistent with WejdanAI brand

## 📁 Project Structure

```
WejdanAI/
├── components/
│   ├── Chat.vue              # Main chat container
│   ├── ChatMessage.vue       # Message bubble component
│   └── ChatInput.vue         # Message input component
├── composables/
│   └── useWebSocket.ts       # WebSocket connection manager
├── pages/
│   ├── index.vue             # Home page with chat link
│   └── chat.vue              # Chat page
├── server/
│   └── api/
│       ├── messages.ts       # Message CRUD endpoints
│       ├── messages/
│       │   └── recent.get.ts # Recent messages endpoint
│       └── websocket.ts      # WebSocket server
└── CHAT_DOCUMENTATION.md     # Comprehensive documentation
```

## 🔧 Configuration

### Nuxt Configuration

The chat system requires experimental WebSocket support:

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

### Database Schema

The messages table is automatically created on first use:

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

## 🎨 Design System

### Color Scheme
- Sent messages: Blue-to-purple gradient
- Received messages: Glass morphism with backdrop blur
- Connection indicator: Green (connected) / Red (disconnected)

### Typography
- Message text: 14px (text-sm)
- Timestamps: 12px (text-xs)
- Headers: 20px (text-xl)

### Spacing
- Message padding: 16px vertical, 24px horizontal
- Input padding: 12px
- Component gaps: 8px (space-y-2) to 16px (space-y-4)

## 📱 Usage

### Sending Messages

1. Type your message in the input field at the bottom
2. Press **Enter** to send
3. Press **Shift+Enter** to add a new line

### Keyboard Shortcuts

- `Enter` - Send message
- `Shift+Enter` - New line
- `Esc` - Clear input (when empty)

### Features in Action

**Typing Indicators:**
- Automatically shown when you type
- Displays other users typing
- Auto-hides after 2 seconds of inactivity

**Connection Status:**
- Green dot: Connected and ready
- Red dot: Disconnected (will auto-retry)

**Auto-Scroll:**
- Automatically scrolls to new messages
- Manual scroll disables auto-scroll
- Re-enables when you scroll to bottom

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

The application is pre-configured for Vercel deployment:

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add `POSTGRES_URL` environment variable
4. Deploy!

### Deploy to Other Platforms

Ensure your hosting platform supports:
- Node.js 18+
- WebSocket connections
- PostgreSQL database access

## 🐛 Troubleshooting

### Common Issues

**WebSocket not connecting:**
- Check that experimental WebSocket is enabled in `nuxt.config.ts`
- Verify your hosting platform supports WebSocket connections
- Check browser console for connection errors

**Database errors:**
- Verify `POSTGRES_URL` is set correctly
- Ensure PostgreSQL server is accessible
- Check SSL requirements (add `?ssl=true` to connection string)

**Messages not appearing:**
- Check WebSocket connection status
- Verify API endpoints are working (`/api/messages/recent`)
- Check browser console for errors

## 📚 Documentation

For comprehensive documentation, see [CHAT_DOCUMENTATION.md](./CHAT_DOCUMENTATION.md)

Topics covered:
- Complete API reference
- Component props and events
- Database schema details
- Customization guide
- Performance optimization
- Security considerations

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [Nuxt 3](https://nuxt.com/) - The Intuitive Vue Framework
- [PostgreSQL](https://www.postgresql.org/) - The World's Most Advanced Open Source Database
- [ws](https://github.com/websockets/ws) - Simple to use WebSocket library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [ms](https://github.com/vercel/ms) - Tiny millisecond conversion utility

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation
- Review existing issues for solutions

---

**Made with ❤️ for WejdanAI**
