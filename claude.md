# Pelvic Lab — Project Instructions

## What This Repository Is

This is the **Pelvic Lab** project — a system for controlling the PelviX (Pelvipower) treatment chair via Zoezi components and a Node.js backend on Replit.

- **Backend:** `server.js` on Replit → `https://pelvic-lab-zoezi.replit.app`
- **Zoezi domain:** `pelviclab.zoezi.se`
- **Device API:** Pelvipower ThirdParty Middleware (see `pelvic-api-docs.md`)

## Repository Structure

| File | Purpose |
|------|---------|
| `server.js` | Express backend — auth, device control, webhooks, auto-lock |
| `pelvic-api-docs.md` | Pelvipower API reference (unlock, abort, webhooks, events) |
| `zoezi-halsodeklaration-COMPLETE.md` | Health declaration form component (Fillout embed) |
| `zoezi-pelvix-starter-COMPLETE.md` | PelviX chair start flow component |
| `pelviclab-webshop-component.md` | Product webshop with configurable props |
| `pelviclab-booking-component.md` | Booking component |
| `pelvic-lab-info.md` | Customer-facing information |

## Key Architecture

### PelviX Session Flow
1. User must complete hälsodeklaration (Fillout form → webhook → `xf.halsodeklaration = true`)
2. User must have an active Zoezi resource booking (checked server-side)
3. Server calls `POST /command/unlock` on Pelvipower API
4. Server schedules `POST /command/abort` when booking ends (auto-lock)
5. Back-to-back bookings are detected — timer extends instead of aborting

### Auto-Lock System (`server.js`)
- `abortDevice(reason)` — calls `POST /command/abort`
- `abortDeviceWithRetry(reason)` — 3 retries with backoff, email alert on failure
- `scheduleSessionAbort(txnId, bookingEnd, ...)` — setTimeout + session state tracking
- `clearSession(txnId, reason)` — clears timer on natural session end
- Safety sweep every 30s catches expired sessions
- Startup safety lock on server boot
- Back-to-back booking detection before aborting
- Duplicate start guard (`startInFlight` Set)

### Component Polling (no page reload needed)
- **Hälsodeklaration** polls every 15s: checks for new bookings AND completion status
- **PelviX Starter** polls every 15s: checks hälsodeklaration status AND bookings
- Flow: form appears → user submits → form disappears → start button appears

### Webhooks
- `POST /api/webhook/fillout-halsodeklaration?secret=X` — Fillout form submission, sets `xf.halsodeklaration = true`
- `POST /api/webhook/pelvic` — Pelvipower device events, payload has `entries[]` array with `transactionId` at top level

## Zoezi API Patterns (IMPORTANT — easy to get wrong)

| Endpoint | Notes |
|----------|-------|
| `GET /api/user/get?id=X` | Query param, NOT path param. Staff API, returns xf fields |
| `POST /api/member/change` | NOT `/api/user/change`. For updating user fields |
| `/api/memberapi/get/current` | Member API — does NOT return xf fields |
| `/api/memberapi/bookings/get` | Member API for bookings (used by frontend components) |
| `/api/resourcebooking/get/booked` | Staff API for booking verification (used by server) |

**XF merge pattern:** Always GET user first → spread existing `user.xf` → add new field → POST full merged xf object. Never overwrite the entire xf.

## Component Deployment

Components are **COMPLETE.md documentation files**. To deploy changes:
1. Edit the COMPLETE.md file in this repo
2. Copy-paste the updated HTML/JS/CSS into the **Zoezi page builder**
3. Components are NOT auto-deployed — manual copy-paste required

---

# Zoezi Component Development Guide

The sections below are generic Zoezi component development instructions.

---

## Quick Start

**Before writing any Zoezi code, read these documents:**

1. **[docs/README.md](./docs/README.md)** - Documentation overview
2. **[docs/zoezi-architecture/SYSTEM-OVERVIEW.md](./docs/zoezi-architecture/SYSTEM-OVERVIEW.md)** - Architecture
3. **[docs/zoezi-architecture/COMPONENT-STRUCTURE.md](./docs/zoezi-architecture/COMPONENT-STRUCTURE.md)** - How to create components
4. **[docs/zoezi-architecture/SERVICES-AND-STATE.md](./docs/zoezi-architecture/SERVICES-AND-STATE.md)** - Services & Vuex
5. **[docs/zoezi-patterns/INTEGRATION-PATTERNS.md](./docs/zoezi-patterns/INTEGRATION-PATTERNS.md)** - Common patterns
6. **[docs/zoezi-components/COMPONENT-REFERENCE.md](./docs/zoezi-components/COMPONENT-REFERENCE.md)** - Key components

---

## Critical Rules

### 1. Component Naming

**All Zoezi components MUST be named with the `zoezi-` prefix:**

```javascript
// ✅ CORRECT
export default {
  name: 'zoezi-my-feature'
}

// ❌ WRONG
export default {
  name: 'my-feature'
}
```

### 2. Zoezi Metadata Required

**All components need the `zoezi` object for page builder integration:**

```javascript
export default {
  name: 'zoezi-my-component',

  zoezi: {
    title: 'My Component',        // REQUIRED: Display name
    icon: 'mdi-star',             // REQUIRED: Material Design Icon
    addon: 'WebShop'              // OPTIONAL: Required module
  }
}
```

### 3. Use Existing Services

**Never write custom API calls - use the provided services:**

```javascript
// ✅ CORRECT
const data = await this.$api.get('/api/endpoint');

// ❌ WRONG
const data = await fetch('/api/endpoint').then(r => r.json());
```

### 4. Always Use Translation

**All user-facing text MUST use the translate service:**

```javascript
// ✅ CORRECT
{{ $translate('Welcome') }}
this.$translate('Error message')

// ❌ WRONG
'Welcome'
'Error message'
```

### 5. Handle Multi-Site

**Always consider site selection when filtering data:**

```javascript
// ✅ CORRECT
const siteId = this.$store.state.selectedSiteId;
const filtered = products.filter(p =>
  !p.sites || p.sites.length === 0 || p.sites.includes(siteId)
);

// ❌ WRONG
const filtered = products; // Ignores site filtering
```

### 6. Check Authentication

**Always verify user authentication before accessing user-specific features:**

```vue
<template>
  <div v-if="$store.state.user">
    <!-- Authenticated content -->
  </div>
  <zoezi-identification v-else :title="$translate('Please log in')" />
</template>
```

---

## Documentation Rule: ONE Master File Per Component

### For Brand-Specific Components (Fysiken, Centralbadet, etc.)

**IMPORTANT:** All Zoezi component documentation files MUST follow this pattern:

### ✅ ALWAYS DO THIS:

1. **ONE single master file per component**
   - Each component has ONE complete file
   - File naming: `[COMPONENT-NAME]-COMPLETE.md`
   - Example: `fysiken-webshop-COMPLETE.md`

2. **FULL working code in every file**
   - Complete HTML section (all markup)
   - Complete JavaScript section (all code)
   - Complete CSS section (all styles)
   - Zero external references
   - Zero partial snippets

3. **When updating components:**
   - ALWAYS edit the existing COMPLETE master file
   - NEVER create a new file with just the updates
   - Update the FULL section (HTML, JS, or CSS) with changes integrated
   - Keep the file as a single source of truth

### ❌ NEVER DO THIS:

1. **NEVER create partial update files**
   - ❌ Files with "ADD THESE" instructions
   - ❌ Files with "UPDATE THIS SECTION" snippets
   - ❌ Files with "See the full code in..." references
   - ❌ Multiple files for the same component

2. **NEVER split code across files**
   - ❌ Separate HTML file + JS file + CSS file
   - ❌ "Part 1" and "Part 2" style documentation
   - ❌ Incremental update files

---

## Component File Structure Template

When creating new components, use this structure:

```vue
<style lang="scss">
.zoezi-mycomponent {
  /* All styles scoped under component class */
}
</style>

<template>
  <div class="zoezi-mycomponent">
    <!-- Loading state -->
    <div v-if="loading" class="text-center">
      {{ $translate('Loading...') }}
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Auth check -->
    <template v-else-if="requiresAuth && !$store.state.user">
      <zoezi-identification :title="$translate('Please log in')" />
    </template>

    <!-- Main content -->
    <template v-else>
      <!-- Component content here -->
    </template>
  </div>
</template>

<script>
export default {
  name: 'zoezi-mycomponent',

  zoezi: {
    title: 'My Component',
    icon: 'mdi-star'
  },

  props: {
    // Props are configurable in page builder
    exampleProp: {
      title: 'Example setting',
      type: Boolean,
      default: true
    }
  },

  data: () => ({
    loading: false,
    items: []
  }),

  computed: {
    // Computed properties
  },

  watch: {
    '$store.state.user': {
      immediate: true,
      handler(user) {
        if (user) this.loadData();
      }
    }
  },

  methods: {
    async loadData() {
      this.loading = true;
      try {
        this.items = await this.$api.get('/api/endpoint');
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.loadData();
  }
}
</script>
```

---

## Common Patterns Reference

### Checkout Integration

```javascript
// Create checkout items
const checkoutItems = [{
  product_id: product.id,
  count: 1,
  price: product.price
}];

// Use in template
<zoezi-checkout
  :items="checkoutItems"
  @almostdone="handleComplete"
/>
```

### Cart Operations

```javascript
// Add to cart
this.$store.dispatch('addToCart', {
  cartName: '',
  product_id: 123,
  count: 1,
  site_id: this.$store.state.selectedSiteId
});

// Show cart
this.$store.dispatch('setCartVisibility', {
  cartName: '',
  showBottomBar: true,
  showCheckout: false
});
```

### Error Handling

```javascript
this.$store.commit('showErrorDialog', {
  title: this.$translate('Error'),
  text: this.$translate('Something went wrong'),
  actionText: this.$translate('Retry'),
  action: () => this.retry()
});
```

### Date Formatting

```javascript
// Use Date extensions
date.yyyymmdd()           // "2025-01-22"
date.hhmm()               // "14:30"
date.isToday()            // true/false
date.addDays(7)           // Add 7 days
Date.today()              // Today at midnight
Date.newFull(dateString)  // Parse date string
```

---

## Folder Structure

```
StrongSales-Zoezi/
├── docs/                           # Documentation (READ FIRST)
│   ├── README.md
│   ├── zoezi-architecture/
│   │   ├── SYSTEM-OVERVIEW.md
│   │   ├── COMPONENT-STRUCTURE.md
│   │   └── SERVICES-AND-STATE.md
│   ├── zoezi-patterns/
│   │   └── INTEGRATION-PATTERNS.md
│   └── zoezi-components/
│       └── COMPONENT-REFERENCE.md
│
├── components/                     # Vue Components (75 total)
│   ├── README.md                   # Component organization guide
│   ├── auth/                       # Login, Identification, Logout, ResetPassword
│   ├── checkout/                   # Checkout, MembershipCheckout, SignContract
│   ├── shop/                       # Shop, ShoppingCart, ProductCard
│   ├── booking/
│   │   ├── group-training/         # GroupTraining, WorkoutTypes
│   │   ├── courses/                # CourseBooking, CourseList
│   │   └── resources/              # ResourceBooking, ResourceBookingCategory
│   ├── user/                       # MyPage, MyPaymentMethods, Family
│   ├── layout/                     # ResponsiveAppBar, TabBar, Stepper
│   ├── dialogs/                    # AddUserDialog, ChangeUserDialog
│   ├── admin/                      # Report, Visitors, QrScanner
│   └── misc/                       # Terms, CookieBar, Video
│
├── main.js                         # App initialization
├── router.js                       # Route configuration
├── dateextensions.js               # Date utilities
│
├── Fysiken/                        # Brand-specific implementations
├── Centralbadet/
├── Pelvic Lab/
├── Sturebadet/
│
└── claude.md                       # This file
```

---

## Key Files to Reference

When working on specific features, reference these files:

| Feature | Reference File |
|---------|---------------|
| Shop/E-commerce | `components/shop/Shop.vue` |
| Checkout/Payments | `components/checkout/Checkout.vue` |
| Group Training | `components/booking/group-training/GroupTraining.vue` |
| Resource Booking | `components/booking/resources/ResourceBooking.vue` |
| Course Booking | `components/booking/courses/CourseBooking.vue` |
| User Dashboard | `components/user/MyPage.vue` |
| Authentication | `components/auth/Identification.vue`, `components/auth/Login.vue` |
| Navigation | `components/layout/ResponsiveAppBar.vue` |

---

## Checklist Before Submitting Code

- [ ] Component name starts with `zoezi-`
- [ ] Has `zoezi` metadata object with title and icon
- [ ] All user-facing text uses `$translate()`
- [ ] Handles loading state
- [ ] Handles authentication check (if needed)
- [ ] Respects multi-site filtering
- [ ] Uses `this.$api` for API calls
- [ ] Uses Vuetify components for UI
- [ ] Styles scoped under component class
- [ ] Props have title for page builder

---

## Debugging Tips

```javascript
// Access from browser console
window.$vue                    // Root Vue instance
window.$store.state            // Vuex state
window.$zoeziapi               // API service
window.$translate('key')       // Test translations

// In components
console.log(this.$store.state.user)
console.log(this.$store.state.settings)
```

---

## Summary for AI

When working with Zoezi components:

1. **Read the docs first** - Check `/docs/` folder
2. **Follow naming conventions** - `zoezi-*` prefix required
3. **Use existing services** - `$api`, `$store`, `$translate`, `$booking`
4. **Handle auth and loading** - Always check user state
5. **Consider multi-site** - Filter by `selectedSiteId`
6. **Reuse components** - Use `zoezi-checkout`, `zoezi-identification`, etc.
7. **One master file** - For brand-specific components, keep everything in one COMPLETE file
8. **Test thoroughly** - Check console for errors

The documentation in `/docs/` has detailed examples and patterns. Always reference it when building new components.
