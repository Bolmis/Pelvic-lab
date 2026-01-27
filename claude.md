# Claude Code Instructions for Zoezi Component Development

This file contains instructions for AI assistants working on Zoezi gym membership platform components.

---

## What This Repository Is

> **This is a REFERENCE REPOSITORY for AI context.**
>
> The Zoezi framework files here (`components/`, `main.js`, `router.js`, `dateextensions.js`) are **read-only reference material**. You study them to understand how Zoezi works, then create NEW integrated apps and components.

### Reference Files (DO NOT MODIFY)

| File/Folder | Contains |
|-------------|----------|
| `components/` | Zoezi framework Vue components |
| `main.js` | App initialization, plugin registration, services |
| `router.js` | Vue Router configuration and route handling |
| `dateextensions.js` | Date prototype extensions and utilities |

### Files You CREATE or MODIFY

| File/Folder | Purpose |
|-------------|---------|
| `Fysiken/` | Custom components for Fysiken gym chain |
| `Centralbadet/` | Custom components for Centralbadet |
| `Pelvic Lab/` | Custom components for Pelvic Lab |
| `Sturebadet/` | Custom components for Sturebadet |
| `[NewBrand]/` | Create new folders for new brand integrations |

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
