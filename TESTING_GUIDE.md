# Chat Feature Testing Guide

## Prerequisites

1. **PostgreSQL Database**
   ```bash
   export POSTGRES_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Testing Scenarios

### 1. Initial Setup & Database Creation

**Test**: First time loading the chat page

**Steps**:
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/chat`
3. Open browser DevTools console

**Expected Behavior**:
- Messages table is automatically created if it doesn't exist
- Console shows: "Messages table does not exist, creating it now..."
- Chat loads with empty state
- Connection status shows "Connected"
- User list shows all users from profiles table

**Success Criteria**:
- ✅ No errors in console
- ✅ Empty state UI displays correctly
- ✅ "No messages yet" message visible
- ✅ User list populated with users

---

### 2. Sending First Message

**Test**: Send a message as the first user

**Steps**:
1. Type a message in the input field: "Hello, this is my first message!"
2. Click Send button (or press Enter)
3. Wait for message to appear

**Expected Behavior**:
- Input field clears after sending
- Message appears in chat area
- Message shows blue gradient background (sent by current user)
- Timestamp shows "just now"
- User avatar and name displayed
- Auto-scroll to message

**Success Criteria**:
- ✅ Message persisted to database
- ✅ Message displays correctly
- ✅ UI updates immediately
- ✅ No console errors

---

### 3. Message History Loading

**Test**: Verify messages persist across page reloads

**Steps**:
1. Send 3-5 messages in the chat
2. Refresh the page (F5)
3. Wait for page to load

**Expected Behavior**:
- Loading spinner appears briefly
- All previously sent messages load
- Messages display in chronological order (oldest first)
- Scroll position starts at bottom
- Message styling preserved (sent messages in blue)

**Success Criteria**:
- ✅ All messages loaded from database
- ✅ Correct order (chronological)
- ✅ Timestamps accurate
- ✅ User information correct

---

### 4. Multiple Messages

**Test**: Send multiple messages in sequence

**Steps**:
1. Send message 1: "First message"
2. Send message 2: "Second message"
3. Send message 3: "Third message"

**Expected Behavior**:
- Each message appears immediately after sending
- Messages stack vertically
- Auto-scroll maintains bottom position
- Each message has unique timestamp
- Send button disabled while sending

**Success Criteria**:
- ✅ All messages visible
- ✅ Proper spacing between messages
- ✅ No duplicate messages
- ✅ Timestamps progress correctly

---

### 5. Long Messages

**Test**: Handle long text content

**Steps**:
1. Type a very long message (300+ characters)
2. Send the message
3. Observe how it displays

**Expected Behavior**:
- Textarea expands as you type (up to max height)
- Message bubble wraps text properly
- No horizontal overflow
- Readable line breaks
- Maintains max-width constraint

**Success Criteria**:
- ✅ Text wraps correctly
- ✅ No layout breaking
- ✅ Scrollable chat area
- ✅ Message readable

---

### 6. Multi-line Messages

**Test**: Send messages with line breaks

**Steps**:
1. Type: "Line 1"
2. Press Shift+Enter
3. Type: "Line 2"
4. Press Shift+Enter
5. Type: "Line 3"
6. Press Enter to send

**Expected Behavior**:
- Textarea expands to show all lines
- Shift+Enter creates new line (doesn't send)
- Enter alone sends message
- Message preserves line breaks in display

**Success Criteria**:
- ✅ All lines visible in message
- ✅ Proper line spacing
- ✅ No extra whitespace

---

### 7. Empty/Whitespace Messages

**Test**: Prevent sending empty messages

**Steps**:
1. Leave input field empty, click Send
2. Type only spaces: "    ", click Send
3. Type tabs and spaces, click Send

**Expected Behavior**:
- Send button remains disabled
- No API call made
- No message added to chat
- Input field validation works

**Success Criteria**:
- ✅ Cannot send empty messages
- ✅ Cannot send whitespace-only messages
- ✅ No unnecessary API calls

---

### 8. Scroll Behavior

**Test**: Auto-scroll and manual scrolling

**Steps**:
1. Send enough messages to make chat scrollable (10+)
2. Scroll to top of chat
3. Send a new message from bottom input
4. Observe scroll behavior

**Expected Behavior**:
- When scrolled up, "↓" button appears
- New message doesn't auto-scroll (user still at top)
- Click "↓" button smoothly scrolls to bottom
- When at bottom, new messages auto-scroll

**Success Criteria**:
- ✅ Scroll button appears/disappears correctly
- ✅ Auto-scroll only when at bottom
- ✅ Manual scroll works smoothly
- ✅ Button click scrolls to bottom

---

### 9. Connection Status

**Test**: Connection indicator behavior

**Steps**:
1. Load chat page
2. Observe connection status in header

**Current Behavior** (simulated):
- Shows "Disconnected" briefly on load
- Changes to "Connected" after 500ms
- Green pulse animation when connected

**Note**: Real WebSocket connection would show actual connection state

**Success Criteria**:
- ✅ Status indicator visible
- ✅ Color changes (red → green)
- ✅ Animation works
- ✅ Text updates

---

### 10. User List (Desktop)

**Test**: User list displays correctly

**Steps**:
1. Load chat on desktop browser (width > 1024px)
2. Observe left sidebar
3. Check user list content

**Expected Behavior**:
- Sidebar visible on desktop
- All users from profiles table listed
- User avatars displayed
- Online status shown (green dot)
- User info (name, email) visible

**Success Criteria**:
- ✅ Sidebar renders on desktop
- ✅ All users listed
- ✅ Avatars load correctly
- ✅ Status indicators show

---

### 11. Responsive Design (Mobile)

**Test**: Chat works on mobile devices

**Steps**:
1. Open chat in Chrome DevTools
2. Toggle device toolbar (mobile view)
3. Test iPhone, iPad, Android sizes

**Expected Behavior**:
- User list hidden on mobile (< 1024px)
- Chat takes full width
- Input field remains at bottom
- Messages readable and properly sized
- Touch scrolling works smoothly
- Send button accessible

**Success Criteria**:
- ✅ Layout adapts to mobile
- ✅ No horizontal scroll
- ✅ Touch-friendly buttons
- ✅ Readable text sizes

---

### 12. Dark Mode

**Test**: Theme switching

**Steps**:
1. Open chat in light mode
2. Change system/browser to dark mode
3. Observe color changes

**Expected Behavior**:
- Background darkens
- Text changes to light colors
- Message bubbles adapt
- Sent messages remain blue gradient
- Received messages show dark theme styling
- All text remains readable

**Success Criteria**:
- ✅ Dark mode applies
- ✅ Proper contrast ratios
- ✅ No white flash
- ✅ All UI elements adapt

---

### 13. Performance with Many Messages

**Test**: Handle large message history

**Steps**:
1. Manually insert 100+ messages into database
2. Reload chat page
3. Observe loading and scrolling

**Expected Behavior**:
- Loading indicator shows
- Messages load in reasonable time
- Scroll remains smooth
- No UI freezing
- Pagination prevents loading all messages

**Success Criteria**:
- ✅ Loads within 3 seconds
- ✅ Smooth scrolling
- ✅ No performance degradation
- ✅ Memory usage acceptable

---

### 14. Error Handling

**Test**: Handle API errors gracefully

**Steps**:
1. Disconnect from database
2. Try to send a message
3. Try to load messages

**Expected Behavior**:
- Error caught and logged
- User sees error state (optional)
- No app crash
- Graceful degradation

**Success Criteria**:
- ✅ No unhandled errors
- ✅ Console shows error details
- ✅ App remains functional
- ✅ Can retry after connection restored

---

### 15. Navigation

**Test**: Navigation between pages

**Steps**:
1. Go to home page (`/`)
2. Click "Go to Chat Room →" button
3. Navigate to chat page
4. Click "← Back to Home" link
5. Return to home page

**Expected Behavior**:
- Smooth transitions
- No page reload
- URL updates
- Chat state preserved
- Navigation links work

**Success Criteria**:
- ✅ All links functional
- ✅ Client-side routing works
- ✅ No 404 errors
- ✅ Back button works

---

## API Testing

### Test GET /api/messages

```bash
curl http://localhost:3000/api/messages
```

**Expected Response**:
```json
{
  "messages": [],
  "count": 0
}
```

### Test POST /api/messages

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "content": "Test message",
    "message_type": "text"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": {
    "id": 1,
    "user_id": 1,
    "content": "Test message",
    "created_at": "2026-01-22T01:00:00.000Z",
    "message_type": "text",
    "user_name": "Guillermo Rauch",
    "user_email": "rauchg@vercel.com",
    "user_image": "https://..."
  }
}
```

---

## Database Testing

### Verify Messages Table

```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

**Expected**: 
- All sent messages present
- Correct user_id references
- Timestamps accurate
- Content stored correctly

### Check User References

```sql
SELECT 
  m.id,
  m.content,
  p.name as user_name
FROM messages m
LEFT JOIN profiles p ON m.user_id = p.id
ORDER BY m.created_at DESC;
```

**Expected**:
- All messages have valid user references
- User names populated
- No orphaned messages

---

## Build Testing

### Development Build
```bash
npm run dev
```
**Expected**: Server starts on port 3000

### Production Build
```bash
npm run build
npm run preview
```
**Expected**: 
- Build completes successfully
- No TypeScript errors
- No build warnings
- Preview runs correctly

---

## Browser Compatibility

Test in multiple browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## Accessibility Testing

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter sends message
   - Escape closes modals (if any)

2. **Screen Reader**
   - Test with NVDA/JAWS/VoiceOver
   - All elements announced correctly
   - Form labels present

3. **Color Contrast**
   - Check contrast ratios meet WCAG AA
   - Both light and dark modes

---

## Security Testing

1. **XSS Prevention**
   - Try injecting `<script>alert('xss')</script>`
   - Should be escaped and displayed as text

2. **SQL Injection**
   - PostgreSQL parameterized queries prevent injection
   - Try special characters in messages: `'; DROP TABLE messages;--`
   - Should be stored as regular text

3. **Input Validation**
   - Very long messages (10,000+ chars)
   - Special Unicode characters
   - Emojis 🎉
   - All should be handled gracefully

---

## Known Limitations

1. **WebSocket**: Currently using simulated connection. Real-time updates require WebSocket server implementation.

2. **Typing Indicators**: UI prepared but not functional without WebSocket.

3. **Online Status**: Currently shows all users as online. Needs presence system.

4. **Multi-user Testing**: Manual refresh needed to see other users' messages.

---

## Troubleshooting

### Messages not appearing
- Check PostgreSQL connection
- Verify POSTGRES_URL environment variable
- Check browser console for errors
- Verify API endpoints responding

### Build errors
- Clear `.nuxt` directory: `rm -rf .nuxt`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (18+)

### Styling issues
- Clear browser cache
- Check Tailwind is compiling
- Verify all classes in safelist

---

## Success Checklist

- [ ] Chat page loads without errors
- [ ] Messages can be sent successfully
- [ ] Messages persist in database
- [ ] Messages load on page refresh
- [ ] UI matches design system
- [ ] Responsive design works
- [ ] Dark mode functions correctly
- [ ] Navigation links work
- [ ] User list displays properly
- [ ] Scroll behavior correct
- [ ] Empty states display
- [ ] Loading states work
- [ ] Error handling graceful
- [ ] No security vulnerabilities
- [ ] Build completes successfully
- [ ] Code review passed
- [ ] CodeQL scan passed
