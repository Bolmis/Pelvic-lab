# PelviX Starter Component - Visibility Function

**Component:** `zoezi-pelvix-starter`
**Purpose:** Control visibility of the PelviX starter component
**Type:** Visibility Function for Zoezi Page Builder

---

## Overview

The booking check logic is now built into the component itself, so the visibility function only needs to check if the user is logged in.

The component handles these states internally:
- **Loading** - While fetching bookings
- **No booking** - User has no upcoming booking within 5 minutes
- **Ready** - User has a booking starting within 5 minutes, can start the device
- **Started** - Device successfully unlocked
- **Error** - Something went wrong

---

## Visibility Function (Simple)

Use this if you want to show the component only for logged-in users:

```javascript
try {
  // Only show for logged-in users
  if (!window.$store || !window.$store.state || !window.$store.state.user) {
    return false;
  }
  return true;
} catch (error) {
  console.error('Visibility check error:', error);
  return false;
}
```

---

## Alternative: No Visibility Function

You can also skip the visibility function entirely. The component will:
1. Show a login prompt for non-authenticated users
2. Show the appropriate state (no booking / ready / etc.) for authenticated users

This is the recommended approach since the component handles all states gracefully.

---

*Last updated: 2026-01-28*
