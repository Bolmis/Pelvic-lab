# Pelvic Lab PelviX Starter Component - COMPLETE (Copy-Paste Ready)

**Component Type:** User-Facing Device Control Component
**Purpose:** Allow users to start their PelviX treatment session by unlocking the device
**Access Level:** Requires login
**Zoezi Domain:** pelviclab.zoezi.se

---

## Features

- Requires user authentication (shows login prompt if not logged in)
- Displays personalized greeting with user's name
- Single "Start PelviX" button to unlock the device
- Shows success confirmation when device is unlocked
- Handles errors gracefully with retry option
- Premium purple gradient design

---

## Configuration

**Backend API URL:** Configure in Zoezi page builder or update the default value in the component.

The backend (Replit) needs these environment variables:
- `PELVIC_CLIENT_ID` - Pelvipower OAuth2 client ID
- `PELVIC_CLIENT_SECRET` - Pelvipower OAuth2 client secret
- `PELVIC_DEVICE_SERIAL_NUMBER` - Device serial number (printed on device)
- `PELVIC_ENV` - `development` or `production`

---

## Installation in Zoezi

1. Go to Zoezi Admin Panel
2. Navigate to Components > Create New Component
3. Name: "PelviX Starter"
4. Copy the complete HTML, JavaScript, and CSS below
5. Update the `apiUrl` prop default value with your Replit URL
6. Save and publish

---

## HTML

```html
<div class="zoezi-pelvix-starter">
  <!-- Loading state -->
  <div v-if="loading" class="text-center pa-8">
    <v-progress-circular indeterminate color="primary" size="64" />
    <div class="mt-4">{{ $translate('Loading...') }}</div>
  </div>

  <!-- Auth check - require login -->
  <template v-else-if="!$store.state.user">
    <zoezi-identification :title="$translate('Please log in to start your PelviX session')" />
  </template>

  <!-- Main content - logged in user -->
  <template v-else>
    <div class="pelvix-card">
      <div class="pelvix-icon">
        <v-icon size="64" color="white">mdi-seat-recline-extra</v-icon>
      </div>

      <div class="user-greeting">
        {{ $translate('Welcome') }}, {{ userName }}!
      </div>

      <div class="pelvix-title">PelviX</div>
      <div class="pelvix-subtitle">{{ $translate('Pelvic floor training system') }}</div>

      <!-- Ready to start state -->
      <template v-if="status === 'ready'">
        <v-btn
          class="pelvix-button start"
          :loading="starting"
          :disabled="starting"
          @click="startPelvix"
        >
          <v-icon left>mdi-play-circle</v-icon>
          {{ $translate('Start PelviX') }}
        </v-btn>
      </template>

      <!-- Started successfully -->
      <template v-else-if="status === 'started'">
        <div class="pelvix-status">
          <div class="pelvix-status-icon">
            <v-icon size="48" color="white">mdi-check-circle</v-icon>
          </div>
          <div class="font-weight-bold">{{ $translate('Device unlocked!') }}</div>
          <div class="mt-2" style="font-size: 14px; opacity: 0.9;">
            {{ $translate('Please take a seat in the PelviX chair to begin your session.') }}
          </div>
        </div>
        <v-btn
          class="pelvix-button mt-4"
          outlined
          dark
          @click="resetStatus"
        >
          {{ $translate('Start new session') }}
        </v-btn>
      </template>

      <!-- Error state -->
      <template v-else-if="status === 'error'">
        <div class="pelvix-error">
          <v-icon color="#ffcdd2" small>mdi-alert-circle</v-icon>
          {{ errorMessage }}
        </div>
        <v-btn
          class="pelvix-button start mt-4"
          @click="resetStatus"
        >
          {{ $translate('Try again') }}
        </v-btn>
      </template>
    </div>
  </template>
</div>
```

---

## JavaScript

```javascript
export default {
  name: 'zoezi-pelvix-starter',

  zoezi: {
    title: 'PelviX Starter',
    icon: 'mdi-seat-recline-extra'
  },

  props: {
    apiUrl: {
      title: 'Backend API URL',
      type: String,
      default: 'https://298a9f30-5c19-44f4-8a22-7887a16908af-00-23a7i7oye5ln.picard.replit.dev'
    }
  },

  data() {
    return {
      loading: false,
      starting: false,
      status: 'ready',
      errorMessage: ''
    };
  },

  computed: {
    userName() {
      const user = this.$store.state.user;
      if (!user) return '';
      return user.firstName || user.name || user.email || '';
    },

    userId() {
      const user = this.$store.state.user;
      return user ? (user.id || user.userId || user.email) : null;
    },

    userFullName() {
      const user = this.$store.state.user;
      if (!user) return '';
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.name || user.firstName || user.email || '';
    }
  },

  methods: {
    async startPelvix() {
      if (!this.userId) {
        this.status = 'error';
        this.errorMessage = this.$translate('User not logged in');
        return;
      }

      this.starting = true;
      this.errorMessage = '';

      try {
        const response = await fetch(`${this.apiUrl}/api/start-pelvix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patientId: String(this.userId),
            patientName: this.userFullName,
            transactionId: `zoezi-${this.userId}-${Date.now()}`
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          this.status = 'started';
        } else {
          this.status = 'error';
          this.errorMessage = data.error || this.$translate('Failed to start PelviX session');
        }
      } catch (error) {
        console.error('PelviX start error:', error);
        this.status = 'error';
        this.errorMessage = this.$translate('Connection error. Please try again.');
      } finally {
        this.starting = false;
      }
    },

    resetStatus() {
      this.status = 'ready';
      this.errorMessage = '';
    }
  }
};
```

---

## CSS

```css
.zoezi-pelvix-starter {
  padding: 20px;
  text-align: center;
}

.zoezi-pelvix-starter .pelvix-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.zoezi-pelvix-starter .pelvix-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.zoezi-pelvix-starter .pelvix-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.zoezi-pelvix-starter .pelvix-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 24px;
}

.zoezi-pelvix-starter .pelvix-button {
  width: 100%;
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 28px;
  text-transform: none;
}

.zoezi-pelvix-starter .pelvix-button.start {
  background: white !important;
  color: #667eea !important;
}

.zoezi-pelvix-starter .pelvix-button.success {
  background: #4caf50 !important;
  color: white !important;
}

.zoezi-pelvix-starter .pelvix-status {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
}

.zoezi-pelvix-starter .pelvix-status-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.zoezi-pelvix-starter .pelvix-error {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  font-size: 14px;
}

.zoezi-pelvix-starter .user-greeting {
  margin-bottom: 16px;
  font-size: 16px;
  opacity: 0.9;
}
```

---

## API Endpoints Used

### Start PelviX Session (Backend)
```
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

---

## Testing Checklist

- [ ] Login prompt shows for non-authenticated users
- [ ] User greeting displays with correct name
- [ ] Start button triggers API call
- [ ] Loading state shows during API call
- [ ] Success state displays after successful unlock
- [ ] Error state displays with message on failure
- [ ] "Try again" button resets to ready state
- [ ] "Start new session" button works after success
- [ ] Mobile responsive design

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

*Last updated: 2026-01-27*
