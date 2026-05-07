## Messaging + in-app notifications (no websockets)

### Goal
Allow a pet owner and sitter to keep each other updated during/after a booking, including sending images, without websockets.

### Approach
- REST APIs + client polling (messages every 5–10s in chat view, notifications every 30–60s globally).
- Messages support `text` and `image` types.
- Images are uploaded via `multipart/form-data` and stored under `backend/uploads/messages/`.

### Data model (backend)
- `Conversation`: `contextType/contextId` can be used to tie a conversation to a booking later.
- `ConversationParticipant`: links users to conversations.
- `Message`: `type=text|image`, `text` (optional)
- `MessageAttachment`: currently used for images (`messages/<filename>`)
- `Notification`: used for `new_message` and booking-related types per recipient

**Tables are prefixed with `chat_`** to avoid collisions with existing tables in the `petsitting` database:
- `chat_conversations`
- `chat_conversation_participants`
- `chat_messages`
- `chat_message_attachments`
- `chat_notifications`

### API endpoints
All endpoints require `Authorization: Bearer <JWT>` unless noted.

- Create / get conversation
  - `POST /api/conversations`
  - Body: `{ "otherUserId": 2, "contextType": "booking", "contextId": 123 }`

- List messages
  - `GET /api/conversations/:id/messages?after=<messageId>&limit=50`

- Send text message
  - `POST /api/conversations/:id/messages`
  - Body: `{ "text": "Hello!" }`

- Send image message
  - `POST /api/conversations/:id/messages/image`
  - Form-data: `image=<file>`

- Notifications
  - `GET /api/notifications?unreadOnly=true`
  - `POST /api/notifications/read` Body: `{ "ids": [1,2,3] }`

### Tests
`backend/test/integration/messaging.api.test.js` covers:
- conversation creation
- POST text → GET messages
- unread notifications → mark read
- image upload → attachment present in message list

### Demo data (optional)
Seeded chat links the two **demo users** created by `seed-demo-users.js` (see **Setup & demo** doc or root `README.md`). **`seed-demo-messages.js` expects those users to exist** (by email).

1. In `backend/.env`, set **`DEMO_SEED_PASSWORD`** (shared password for both demo accounts when seeding). **Do not commit** `.env` or paste passwords into GitHub.
2. Run the full chain (order matters), e.g.:

```bash
cd backend
npm run seed
```

Or manually: `seed-demo-users.js` → sitter profile + animal types → `demo-animals.js` → **`seed-demo-messages.js`**.

The message seeder is idempotent and creates a demo conversation with a tiny (1x1) PNG under `backend/uploads/messages/`.
