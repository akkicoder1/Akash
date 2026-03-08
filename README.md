# Akash Backend (Express + Evolution API + OpenRouter/Gemini)

## What is included
- Modular backend structure with `routes`, `controllers`, `services`, `libs`, `models`, and `config`.
- Evolution API integration for inbound webhook processing and outbound WhatsApp replies.
- AI auto-reply pipeline via OpenRouter (Gemini model configurable).
- Human handoff detection with admin notifications persisted in MongoDB.
- Admin notification endpoints + live SSE stream for dashboard integration.
- User model + JWT login/signup system for secure admin/agent actions.
- Automation readiness endpoint to verify env/database prerequisites.
- Env-driven frontend/backend linking and hosting URLs for production flexibility.
- Evolution-powered mass-message automation for product links and offers.

## Setup
1. Copy `.env.example` to `.env` and fill secrets.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start server:
   ```bash
   npm run dev
   ```

## Frontend/Backend linking (env-driven)
Set these variables so hosting links can be changed without code edits:
- `BACKEND_PUBLIC_URL`: public backend base URL (e.g. production API domain)
- `FRONTEND_URL`: frontend app base URL
- `ADMIN_DASHBOARD_URL`: dashboard URL for admin UX links
- `CORS_ORIGINS`: comma-separated frontend origins allowed by backend CORS
- `EVOLUTION_WEBHOOK_URL`: explicit public webhook URL for Evolution (optional override)

You can inspect effective runtime values via:
- `GET /api/system/links`
- `GET /api/automation/check`

## Evolution automation for offers & product links
The backend now supports admin-triggered broadcast campaigns to all known WhatsApp contacts (from conversations) or a custom recipient list.

- Preview payload/message and recipient count:
  - `POST /api/automation/mass-message/preview`
- Send mass campaign via Evolution API:
  - `POST /api/automation/mass-message/send`

Both endpoints require `admin` JWT auth.

### Example body
```json
{
  "title": "Mega Weekend Offer",
  "offerText": "Get flat 25% off today only!",
  "productLinks": [
    "https://yourstore.com/p/offer-1",
    "https://yourstore.com/p/offer-2"
  ]
}
```

If `recipients` is omitted, backend targets all contacts stored in `Conversation.contact`.
Default title/text/links/throttling can be controlled via:
- `BROADCAST_DEFAULT_TITLE`
- `BROADCAST_DEFAULT_OFFER_TEXT`
- `BROADCAST_PRODUCT_LINKS`
- `BROADCAST_DELAY_MS`
- `BROADCAST_MAX_RECIPIENTS`

## API Overview
### Public
- `GET /api/health`
- `GET /api/automation/check`
- `GET /api/system/links`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/webhooks/evolution` - Evolution webhook ingestion.

### Protected (Bearer token required)
- `GET /api/auth/me`
- `POST /api/messages/send` - manual/admin message send.
- `GET /api/admin/notifications` - fetch dashboard notifications.
- `PATCH /api/admin/notifications/:id/read` - mark notification read.
- `GET /api/admin/notifications/stream` - Server-Sent Events live feed.

### Protected (admin only)
- `POST /api/automation/mass-message/preview`
- `POST /api/automation/mass-message/send`

## Webhook payload expectations
The webhook processor accepts common Evolution payload forms:
- `body.data.key.remoteJid` for sender.
- `body.data.message.conversation` or `extendedTextMessage.text` for content.

## Handoff behavior
If inbound text includes configured handoff keywords (`HUMAN_HANDOFF_KEYWORDS`), the backend:
1. sets conversation status to `human_handoff`,
2. creates admin notification, and
3. sends user a confirmation that a human will respond.
