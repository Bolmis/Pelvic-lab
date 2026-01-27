# Pelvic Lab PelviX Starter Component - COMPLETE (Copy-Paste Ready)

**Component Type:** User-Facing Device Control Component
**Purpose:** Allow users to start their PelviX treatment session by unlocking the device
**Access Level:** Requires login
**Zoezi Domain:** pelviclab.zoezi.se

---

## Features

- Requires user authentication (shows login prompt if not logged in)
- Displays personalized greeting with user's name
- Large, mobile-friendly "Start PelviX" button
- Shows success confirmation when device is unlocked
- Handles errors gracefully with retry option
- Premium white/gray/gold design matching Pelvic Lab brand

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
  <div v-if="loading" class="pxs-loading">
    <div class="pxs-spinner"></div>
    <p>{{ $translate('Loading...') }}</p>
  </div>

  <!-- Auth check - require login -->
  <template v-else-if="!$store.state.user">
    <zoezi-identification :title="$translate('Logga in för att starta din PelviX-behandling')" />
  </template>

  <!-- Main content - logged in user -->
  <template v-else>
    <!-- Hero Section -->
    <div class="pxs-hero">
      <div class="pxs-hero-content">
        <div class="pxs-hero-badge">Bäckenbottenträning</div>
        <h1 class="pxs-hero-title">Starta PelviX</h1>
        <p class="pxs-hero-subtitle">Välkommen, {{ userName }}!</p>
      </div>
      <div class="pxs-hero-decoration"></div>
    </div>

    <!-- Main Card -->
    <div class="pxs-card">
      <!-- Ready to start state -->
      <template v-if="status === 'ready'">
        <div class="pxs-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <h2 class="pxs-card-title">Redo att börja?</h2>
        <p class="pxs-card-text">Tryck på knappen nedan för att låsa upp din PelviX-stol och påbörja din behandling.</p>

        <button
          class="pxs-start-button"
          :class="{ 'pxs-loading-btn': starting }"
          :disabled="starting"
          @click="startPelvix"
        >
          <span v-if="!starting" class="pxs-btn-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>
            </svg>
            Starta PelviX
          </span>
          <span v-else class="pxs-btn-content">
            <div class="pxs-btn-spinner"></div>
            Låser upp...
          </span>
        </button>
      </template>

      <!-- Started successfully -->
      <template v-else-if="status === 'started'">
        <div class="pxs-card-icon pxs-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 class="pxs-card-title">Stolen är upplåst!</h2>
        <p class="pxs-card-text">Sätt dig i PelviX-stolen för att påbörja din behandling. Stolen låser sig automatiskt om 5 minuter.</p>

        <div class="pxs-info-box">
          <div class="pxs-info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="pxs-info-text">
            <strong>22 minuter</strong>
            <span>Behandlingstid</span>
          </div>
        </div>

        <button class="pxs-secondary-button" @click="resetStatus">
          Starta ny session
        </button>
      </template>

      <!-- Error state -->
      <template v-else-if="status === 'error'">
        <div class="pxs-card-icon pxs-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 class="pxs-card-title">Något gick fel</h2>
        <p class="pxs-card-text pxs-error-text">{{ errorMessage }}</p>

        <button class="pxs-start-button" @click="resetStatus">
          <span class="pxs-btn-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Försök igen
          </span>
        </button>
      </template>
    </div>

    <!-- Info Cards -->
    <div class="pxs-info-cards">
      <div class="pxs-info-card">
        <div class="pxs-info-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <span>Helt smärtfritt</span>
      </div>
      <div class="pxs-info-card">
        <div class="pxs-info-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <span>Bevisad effekt</span>
      </div>
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
        this.errorMessage = this.$translate('Användare ej inloggad');
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
          this.errorMessage = data.error || this.$translate('Kunde inte starta PelviX-sessionen');
        }
      } catch (error) {
        console.error('PelviX start error:', error);
        this.status = 'error';
        this.errorMessage = this.$translate('Anslutningsfel. Försök igen.');
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
/* ========================================
   PELVIC LAB - PELVIX STARTER COMPONENT
   Premium Design: White, Gray, Gold
   Mobile-First Responsive
   ======================================== */

/* CSS Variables */
.zoezi-pelvix-starter {
  --pxs-gold: #C9A962;
  --pxs-gold-light: #E8D5A8;
  --pxs-gold-dark: #9A7B3A;
  --pxs-white: #FFFFFF;
  --pxs-gray-50: #FAFAFA;
  --pxs-gray-100: #F5F5F5;
  --pxs-gray-200: #EEEEEE;
  --pxs-gray-300: #E0E0E0;
  --pxs-gray-400: #BDBDBD;
  --pxs-gray-500: #9E9E9E;
  --pxs-gray-600: #757575;
  --pxs-gray-700: #616161;
  --pxs-gray-800: #424242;
  --pxs-gray-900: #212121;
  --pxs-success: #4CAF50;
  --pxs-error: #F44336;
  --pxs-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --pxs-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --pxs-shadow-gold: 0 10px 40px -10px rgba(201, 169, 98, 0.5);
  --pxs-radius: 16px;
  --pxs-radius-lg: 24px;
  --pxs-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Container */
.zoezi-pelvix-starter {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 500px;
  margin: 0 auto;
  padding: 16px;
  background: var(--pxs-white);
  color: var(--pxs-gray-900);
  line-height: 1.6;
}

/* Loading State */
.zoezi-pelvix-starter .pxs-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
}

.zoezi-pelvix-starter .pxs-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--pxs-gray-200);
  border-top-color: var(--pxs-gold);
  border-radius: 50%;
  animation: pxs-spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes pxs-spin {
  to { transform: rotate(360deg); }
}

/* Hero Section */
.zoezi-pelvix-starter .pxs-hero {
  position: relative;
  background: linear-gradient(135deg, var(--pxs-gray-900) 0%, #2D2D2D 100%);
  border-radius: var(--pxs-radius-lg);
  padding: 40px 24px;
  margin-bottom: 24px;
  overflow: hidden;
  text-align: center;
}

.zoezi-pelvix-starter .pxs-hero-content {
  position: relative;
  z-index: 1;
}

.zoezi-pelvix-starter .pxs-hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--pxs-gold) 0%, var(--pxs-gold-light) 100%);
  color: var(--pxs-gray-900);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.zoezi-pelvix-starter .pxs-hero-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--pxs-white);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.zoezi-pelvix-starter .pxs-hero-subtitle {
  font-size: 16px;
  color: var(--pxs-gray-400);
  margin: 0;
}

.zoezi-pelvix-starter .pxs-hero-decoration {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, var(--pxs-gold) 0%, transparent 70%);
  opacity: 0.15;
  pointer-events: none;
}

/* Main Card */
.zoezi-pelvix-starter .pxs-card {
  background: var(--pxs-white);
  border: 2px solid var(--pxs-gray-200);
  border-radius: var(--pxs-radius-lg);
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 20px;
}

.zoezi-pelvix-starter .pxs-card-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--pxs-gold-light) 0%, var(--pxs-gold) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.zoezi-pelvix-starter .pxs-card-icon svg {
  width: 40px;
  height: 40px;
  stroke: var(--pxs-white);
  color: var(--pxs-white);
}

.zoezi-pelvix-starter .pxs-card-icon.pxs-success {
  background: linear-gradient(135deg, #81C784 0%, var(--pxs-success) 100%);
}

.zoezi-pelvix-starter .pxs-card-icon.pxs-error {
  background: linear-gradient(135deg, #E57373 0%, var(--pxs-error) 100%);
}

.zoezi-pelvix-starter .pxs-card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--pxs-gray-900);
  margin: 0 0 12px 0;
}

.zoezi-pelvix-starter .pxs-card-text {
  font-size: 15px;
  color: var(--pxs-gray-600);
  margin: 0 0 28px 0;
  line-height: 1.6;
}

.zoezi-pelvix-starter .pxs-error-text {
  color: var(--pxs-error);
}

/* Start Button - Large & Mobile Friendly */
.zoezi-pelvix-starter .pxs-start-button {
  width: 100%;
  min-height: 72px;
  background: linear-gradient(135deg, var(--pxs-gold) 0%, var(--pxs-gold-dark) 100%);
  border: none;
  border-radius: 36px;
  color: var(--pxs-white);
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--pxs-transition);
  box-shadow: var(--pxs-shadow-gold);
  padding: 0 32px;
}

.zoezi-pelvix-starter .pxs-start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 44px -10px rgba(201, 169, 98, 0.6);
}

.zoezi-pelvix-starter .pxs-start-button:active:not(:disabled) {
  transform: translateY(0);
}

.zoezi-pelvix-starter .pxs-start-button:disabled {
  opacity: 0.8;
  cursor: wait;
}

.zoezi-pelvix-starter .pxs-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.zoezi-pelvix-starter .pxs-btn-content svg {
  width: 24px;
  height: 24px;
}

.zoezi-pelvix-starter .pxs-btn-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--pxs-white);
  border-radius: 50%;
  animation: pxs-spin 1s linear infinite;
}

/* Secondary Button */
.zoezi-pelvix-starter .pxs-secondary-button {
  width: 100%;
  min-height: 56px;
  background: var(--pxs-white);
  border: 2px solid var(--pxs-gray-300);
  border-radius: 28px;
  color: var(--pxs-gray-700);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--pxs-transition);
  margin-top: 16px;
}

.zoezi-pelvix-starter .pxs-secondary-button:hover {
  border-color: var(--pxs-gold);
  color: var(--pxs-gold-dark);
}

/* Info Box */
.zoezi-pelvix-starter .pxs-info-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(201, 169, 98, 0.15) 100%);
  border: 1px solid var(--pxs-gold-light);
  border-radius: var(--pxs-radius);
  padding: 20px 24px;
  margin-bottom: 24px;
}

.zoezi-pelvix-starter .pxs-info-icon {
  width: 48px;
  height: 48px;
  background: var(--pxs-white);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--pxs-shadow);
}

.zoezi-pelvix-starter .pxs-info-icon svg {
  width: 24px;
  height: 24px;
  stroke: var(--pxs-gold);
}

.zoezi-pelvix-starter .pxs-info-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.zoezi-pelvix-starter .pxs-info-text strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--pxs-gray-900);
}

.zoezi-pelvix-starter .pxs-info-text span {
  font-size: 13px;
  color: var(--pxs-gray-600);
}

/* Info Cards */
.zoezi-pelvix-starter .pxs-info-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.zoezi-pelvix-starter .pxs-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--pxs-gray-50);
  border-radius: var(--pxs-radius);
  padding: 16px;
}

.zoezi-pelvix-starter .pxs-info-card-icon {
  width: 40px;
  height: 40px;
  background: var(--pxs-white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.zoezi-pelvix-starter .pxs-info-card-icon svg {
  width: 20px;
  height: 20px;
  stroke: var(--pxs-gold);
}

.zoezi-pelvix-starter .pxs-info-card span {
  font-size: 13px;
  font-weight: 600;
  color: var(--pxs-gray-700);
}

/* Mobile Optimizations */
@media (max-width: 480px) {
  .zoezi-pelvix-starter {
    padding: 12px;
  }

  .zoezi-pelvix-starter .pxs-hero {
    padding: 32px 20px;
    border-radius: var(--pxs-radius);
  }

  .zoezi-pelvix-starter .pxs-hero-title {
    font-size: 28px;
  }

  .zoezi-pelvix-starter .pxs-card {
    padding: 28px 20px;
    border-radius: var(--pxs-radius);
  }

  .zoezi-pelvix-starter .pxs-start-button {
    min-height: 64px;
    font-size: 18px;
  }

  .zoezi-pelvix-starter .pxs-info-cards {
    grid-template-columns: 1fr;
  }
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
- [ ] Large start button is easy to tap on mobile
- [ ] Loading state shows spinner during API call
- [ ] Success state displays with treatment info
- [ ] Error state displays with Swedish message
- [ ] "Försök igen" button resets to ready state
- [ ] "Starta ny session" button works after success
- [ ] Colors match Pelvic Lab brand (gold/gray/white)
- [ ] Mobile responsive design works

---

## User Flow

1. User visits the page with the PelviX Starter component
2. If not logged in, user sees login prompt
3. Once logged in, user sees hero banner and "Starta PelviX" button
4. User taps the large gold button
5. Button shows loading spinner "Låser upp..."
6. Backend authenticates with Pelvipower and sends unlock command
7. Device unlocks (5-minute timeout to start session)
8. User sees success message with 22-minute treatment time
9. User takes seat in PelviX chair and treatment begins

---

*Last updated: 2026-01-27*
