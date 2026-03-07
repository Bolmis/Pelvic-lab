# Pelvic Lab Hälsodeklaration Component - COMPLETE (Copy-Paste Ready)

**Component Type:** User-Facing Form Embed
**Purpose:** Embed the Fillout health declaration form so users can complete their Hälsodeklaration before using PelviX
**Access Level:** Requires login, only visible when hälsodeklaration is NOT completed
**Zoezi Domain:** pelviclab.zoezi.se

---

## Features

- Requires user authentication (shows login prompt if not logged in)
- Only visible when user has NOT completed hälsodeklaration (xf.halsodeklaration !== true)
- Embeds Fillout form with user's Zoezi ID as ref parameter
- Premium design matching Pelvic Lab brand (white/gray/gold)
- On form completion, webhook sets xf.halsodeklaration = true in Zoezi

---

## Configuration

**Fillout Form ID:** `jqZa8noHQgus`
**Fillout Domain:** `forms.strongsales.se`

The backend (Replit) receives a webhook from Fillout when the form is submitted and updates the user's xf.halsodeklaration field in Zoezi.

---

## Installation in Zoezi

1. Go to Zoezi Admin Panel
2. Navigate to Components > Create New Component
3. Name: "Hälsodeklaration"
4. Copy the complete HTML, JavaScript, and CSS below
5. Save and publish
6. Place on the same page as PelviX Starter (above it)

---

## Visibility Function

The component handles its own visibility internally by calling the server endpoint
`GET /api/check-halsodeklaration?userId=X` to check the `xf.halsodeklaration` field
(since `/api/memberapi/get/current` does not include extra fields).

No page builder visibility function is needed - the component renders empty when
the user has already completed the form.

Optionally, you can add a simple login check in the page builder:

```javascript
try {
  if (!window.$store || !window.$store.state || !window.$store.state.user) {
    return false;
  }
  return true;
} catch (error) {
  return false;
}
```

---

## HTML

```html
<div class="zoezi-halsodeklaration">
  <!-- Loading state (shown for both components while checking) -->
  <div v-if="loading" class="hd-loading-state">
    <div class="hd-spinner"></div>
    <span>Kontrollerar status...</span>
  </div>

  <!-- Auth check - require login -->
  <template v-else-if="!$store.state.user">
    <zoezi-identification :title="$translate('Logga in för att starta din PelviX-behandling')" />
  </template>

  <!-- Already completed - render nothing, PelviX Starter takes over -->
  <template v-else-if="hasCompleted">
  </template>

  <!-- Form embed -->
  <template v-else>
    <!-- Hero Section -->
    <div class="hd-hero">
      <div class="hd-hero-content">
        <div class="hd-hero-badge">Obligatoriskt</div>
        <h1 class="hd-hero-title">Hälsodeklaration</h1>
        <p class="hd-hero-subtitle">Fyll i formuläret nedan innan du kan starta din PelviX-behandling</p>
      </div>
      <div class="hd-hero-decoration"></div>
    </div>

    <!-- Fillout Form Embed -->
    <div class="hd-form-card">
      <div class="fillout-embed-wrapper">
        <div
          v-if="currentUserId"
          ref="filloutContainer"
          :style="containerStyle"
          :data-fillout-id="filloutId"
          data-fillout-embed-type="standard"
          data-fillout-inherit-parameters
          data-fillout-dynamic-resize
          :data-fillout-domain="filloutDomain"
          :data-ref="String(currentUserId)"
        ></div>
        <div v-else :style="containerStyle" class="hd-loading">
          <div class="hd-spinner"></div>
          <span>Laddar formulär...</span>
        </div>
      </div>
    </div>
  </template>
</div>
```

---

## JavaScript

```javascript
export default {
  name: 'zoezi-halsodeklaration',

  zoezi: {
    title: 'Hälsodeklaration',
    icon: 'mdi-file-document-edit'
  },

  props: {
    apiUrl: {
      title: 'Backend API URL',
      type: String,
      default: 'https://298a9f30-5c19-44f4-8a22-7887a16908af-00-23a7i7oye5ln.picard.replit.dev'
    },
    filloutId: {
      title: 'Fillout Form ID',
      type: String,
      default: 'jqZa8noHQgus'
    },
    filloutDomain: {
      title: 'Fillout Domain',
      type: String,
      default: 'forms.strongsales.se'
    },
    height: {
      title: 'Height (px)',
      type: Number,
      default: 600
    }
  },

  data() {
    return {
      loading: true,
      currentUserId: null,
      hasCompleted: false
    };
  },

  computed: {
    containerStyle() {
      return {
        width: '100%',
        height: this.height + 'px'
      };
    }
  },

  watch: {
    '$store.state.user': {
      immediate: true,
      handler(user) {
        if (user) {
          this.fetchCurrentUser();
        } else {
          this.loading = false;
        }
      }
    },

    currentUserId(newVal) {
      if (newVal) {
        this.checkHalsodeklaration();
      }
    }
  },

  methods: {
    async fetchCurrentUser() {
      try {
        var me = await window.$zoeziapi.get('/api/memberapi/get/current');
        this.currentUserId = me.id;
        console.log('Halsodeklaration - User ID fetched:', this.currentUserId);
      } catch (error) {
        console.error('Halsodeklaration - Error fetching user:', error);
        this.loading = false;
      }
    },

    async checkHalsodeklaration() {
      try {
        var response = await fetch(this.apiUrl + '/api/check-halsodeklaration?userId=' + this.currentUserId);
        var data = await response.json();
        this.hasCompleted = data.completed === true;
        console.log('Halsodeklaration - Status:', this.hasCompleted);

        if (!this.hasCompleted) {
          this.$nextTick(() => {
            this.loadFilloutScript();
          });
        }
      } catch (error) {
        console.error('Halsodeklaration - Error checking status:', error);
        this.hasCompleted = false;
        this.$nextTick(() => {
          this.loadFilloutScript();
        });
      } finally {
        this.loading = false;
      }
    },

    loadFilloutScript() {
      var existingScript = document.querySelector('script[src*="fillout.com/embed"]');
      if (existingScript) {
        existingScript.remove();
      }

      if (window.Fillout) {
        delete window.Fillout;
      }

      console.log('Halsodeklaration - Loading Fillout script...');

      var script = document.createElement('script');
      script.src = 'https://server.fillout.com/embed/v1/';
      script.async = true;
      script.onload = function() {
        console.log('Halsodeklaration - Fillout script loaded');
      };
      document.head.appendChild(script);
    }
  }
};
```

---

## CSS

```css
/* ========================================
   PELVIC LAB - HALSODEKLARATION COMPONENT
   Premium Design: White, Gray, Gold
   Mobile-First Responsive
   ======================================== */

.zoezi-halsodeklaration {
  --hd-gold: #C9A962;
  --hd-gold-light: #E8D5A8;
  --hd-gold-dark: #9A7B3A;
  --hd-white: #FFFFFF;
  --hd-gray-50: #FAFAFA;
  --hd-gray-100: #F5F5F5;
  --hd-gray-200: #EEEEEE;
  --hd-gray-300: #E0E0E0;
  --hd-gray-400: #BDBDBD;
  --hd-gray-500: #9E9E9E;
  --hd-gray-600: #757575;
  --hd-gray-700: #616161;
  --hd-gray-800: #424242;
  --hd-gray-900: #212121;
  --hd-success: #4CAF50;
  --hd-radius: 16px;
  --hd-radius-lg: 24px;
  --hd-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.zoezi-halsodeklaration {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  background: var(--hd-white);
  color: var(--hd-gray-900);
  line-height: 1.6;
}

/* Hero Section */
.zoezi-halsodeklaration .hd-hero {
  position: relative;
  background: linear-gradient(135deg, var(--hd-gray-900) 0%, #2D2D2D 100%);
  border-radius: var(--hd-radius-lg);
  padding: 40px 24px;
  margin-bottom: 24px;
  overflow: hidden;
  text-align: center;
}

.zoezi-halsodeklaration .hd-hero-content {
  position: relative;
  z-index: 1;
}

.zoezi-halsodeklaration .hd-hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, #F44336 0%, #E53935 100%);
  color: var(--hd-white);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.zoezi-halsodeklaration .hd-hero-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--hd-white);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.zoezi-halsodeklaration .hd-hero-subtitle {
  font-size: 15px;
  color: var(--hd-gray-400);
  margin: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.zoezi-halsodeklaration .hd-hero-decoration {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, var(--hd-gold) 0%, transparent 70%);
  opacity: 0.15;
  pointer-events: none;
}

/* Form Card */
.zoezi-halsodeklaration .hd-form-card {
  background: var(--hd-white);
  border: 2px solid var(--hd-gray-200);
  border-radius: var(--hd-radius-lg);
  padding: 8px;
  overflow: hidden;
}

.zoezi-halsodeklaration .fillout-embed-wrapper {
  width: 100%;
}

/* Loading State (initial check) */
.zoezi-halsodeklaration .hd-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  color: var(--hd-gray-600);
  font-size: 14px;
  gap: 16px;
}

/* Loading State (form) */
.zoezi-halsodeklaration .hd-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--hd-gray-50);
  color: var(--hd-gray-600);
  font-size: 14px;
  gap: 16px;
}

.zoezi-halsodeklaration .hd-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--hd-gray-200);
  border-top-color: var(--hd-gold);
  border-radius: 50%;
  animation: hd-spin 1s linear infinite;
}

@keyframes hd-spin {
  to { transform: rotate(360deg); }
}

/* Completed State */
.zoezi-halsodeklaration .hd-completed {
  text-align: center;
  padding: 48px 24px;
}

.zoezi-halsodeklaration .hd-completed-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #81C784 0%, var(--hd-success) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.zoezi-halsodeklaration .hd-completed-icon svg {
  width: 40px;
  height: 40px;
  stroke: var(--hd-white);
}

.zoezi-halsodeklaration .hd-completed h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--hd-gray-900);
  margin: 0 0 12px 0;
}

.zoezi-halsodeklaration .hd-completed p {
  font-size: 15px;
  color: var(--hd-gray-600);
  margin: 0;
}

/* Mobile Optimizations */
@media (max-width: 480px) {
  .zoezi-halsodeklaration {
    padding: 12px;
  }

  .zoezi-halsodeklaration .hd-hero {
    padding: 32px 20px;
    border-radius: var(--hd-radius);
  }

  .zoezi-halsodeklaration .hd-hero-title {
    font-size: 24px;
  }

  .zoezi-halsodeklaration .hd-form-card {
    border-radius: var(--hd-radius);
    padding: 4px;
  }
}
```

---

## How It Works

1. User visits the page with the Hälsodeklaration component
2. If not logged in, user sees login prompt
3. If already completed (`xf.halsodeklaration === true`), shows completion message
4. Otherwise, shows the Fillout health declaration form
5. Form passes user's Zoezi ID as `ref` parameter
6. When user submits, Fillout sends webhook to server
7. Server sets `xf.halsodeklaration = true` in Zoezi
8. On next page load, this component hides and PelviX Starter becomes visible

---

## Webhook Flow

1. User submits Fillout form
2. Fillout sends POST to `https://<server>/api/webhook/fillout-halsodeklaration?secret=<WEBHOOK_SECRET>`
3. Server extracts `ref` (user ID) from submission data
4. Server calls Zoezi API: `POST /api/user/change` with merged xf including `halsodeklaration: true`
5. Returns 200 OK

---

## Testing Checklist

- [ ] Login prompt shows for non-authenticated users
- [ ] Form shows for users with xf.halsodeklaration !== true
- [ ] Form is hidden for users with xf.halsodeklaration === true
- [ ] Fillout form loads with correct form ID
- [ ] User ID is passed as ref parameter
- [ ] Webhook fires on form submission
- [ ] Server sets xf.halsodeklaration to true
- [ ] PelviX Starter appears after page reload
- [ ] Mobile responsive design works

---

*Last updated: 2026-03-07*
