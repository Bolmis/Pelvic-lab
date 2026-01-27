# PelviX Starter Component

A Zoezi component that allows logged-in users to start their PelviX treatment session by unlocking the device.

---

## Overview

The `zoezi-pelvix-starter` component provides a simple interface for Pelvic Lab customers to start their PelviX treatment. When the user clicks "Start PelviX", the component calls the backend API which authenticates with the Pelvipower system and unlocks the device.

---

## Features

- Requires user authentication (shows login prompt if not logged in)
- Displays personalized greeting with user's name
- Single "Start PelviX" button to unlock the device
- Shows success confirmation when device is unlocked
- Handles errors gracefully with retry option

---

## Setup Requirements

### 1. Replit Secrets (Environment Variables)

Add these secrets in your Replit project:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `PELVIC_CLIENT_ID` | Pelvipower OAuth2 client ID | `your-client-id` |
| `PELVIC_CLIENT_SECRET` | Pelvipower OAuth2 client secret | `your-secret` |
| `PELVIC_DEVICE_SERIAL_NUMBER` | Device serial number (on device) | `PEL-12345` |
| `PELVIC_ENV` | Environment (`development` or `production`) | `development` |

### 2. Component Configuration

In the Zoezi page builder, configure the `apiUrl` prop to point to your Replit deployment:

```
apiUrl: https://your-replit-project.replit.app
```

---

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiUrl` | String | `https://your-replit-url.replit.app` | Backend API URL |

---

## API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "environment": "development",
  "hasCredentials": true
}
```

### Start PelviX Session

```http
POST /api/start-pelvix
Content-Type: application/json

{
  "patientId": "user-123",
  "patientName": "John Doe",
  "transactionId": "zoezi-123-1706000000000"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Device unlocked successfully",
  "transactionId": "zoezi-123-1706000000000"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to unlock device: 401 - Unauthorized"
}
```

### Webhook (for Pelvipower events)

```http
POST /api/webhook/pelvic
```

Receives events from Pelvipower when treatments start, stop, etc.

---

## User Flow

1. User visits the page with the PelviX Starter component
2. If not logged in, user sees login prompt
3. Once logged in, user sees personalized greeting and "Start PelviX" button
4. User clicks "Start PelviX"
5. Component calls backend API
6. Backend authenticates with Pelvipower and sends unlock command
7. Device unlocks (5-minute timeout to start session)
8. User sees success message and takes seat in PelviX chair
9. Device screen shows patient name and treatment can begin

---

## Component Code

The full component code is in `zoezi-pelvix-starter.vue`.

### Key Parts

**Authentication Check:**
```vue
<template v-else-if="!$store.state.user">
  <zoezi-identification :title="$translate('Please log in to start your PelviX session')" />
</template>
```

**Start Button:**
```vue
<v-btn
  class="pelvix-button start"
  :loading="starting"
  @click="startPelvix"
>
  <v-icon left>mdi-play-circle</v-icon>
  {{ $translate('Start PelviX') }}
</v-btn>
```

**API Call:**
```javascript
const response = await fetch(`${this.apiUrl}/api/start-pelvix`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientId: String(this.userId),
    patientName: this.userFullName,
    transactionId: `zoezi-${this.userId}-${Date.now()}`
  })
});
```

---

## Testing

### Local Testing

1. Start the server: `node server.js`
2. Check health: `curl http://localhost:5000/api/health`
3. Test unlock (requires valid credentials):
```bash
curl -X POST http://localhost:5000/api/start-pelvix \
  -H "Content-Type: application/json" \
  -d '{"patientId": "test-001", "patientName": "Test User"}'
```

### Replit Testing

1. Deploy to Replit
2. Add secrets in Replit's Secrets tab
3. Use the provided Replit URL in the component's `apiUrl` prop

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Missing credentials | Secrets not configured | Add PELVIC_* secrets in Replit |
| Failed to obtain access token | Invalid client credentials | Verify CLIENT_ID and CLIENT_SECRET |
| Failed to unlock device | Device not provisioned | Contact Pelvipower to enable third-party mode |
| Connection error | Network issues | Check Replit deployment status |

---

## Future Enhancements

- [ ] Fetch remaining training units from Zoezi (user's clip card balance)
- [ ] Show session history
- [ ] Real-time status updates via webhooks
- [ ] Multiple device support
- [ ] Custom treatment presets

---

*Last updated: 2026-01-27*
