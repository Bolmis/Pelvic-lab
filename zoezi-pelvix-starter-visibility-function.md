# PelviX Starter Component - Visibility Function

**Component:** `zoezi-pelvix-starter`
**Purpose:** Control visibility of the PelviX starter component
**Type:** Visibility Function for Zoezi Page Builder

---

## Overview

The PelviX Starter component requires the user to have completed the Hälsodeklaration (health declaration form) before it becomes visible. The booking check logic is built into the component itself.

The visibility function checks:
1. User is logged in
2. User has completed the hälsodeklaration (`xf.halsodeklaration === true`)

The component handles these states internally:
- **Loading** - While fetching bookings
- **No booking** - User has no upcoming booking within 5 minutes
- **Ready** - User has a booking starting within 5 minutes, can start the device
- **Started** - Device successfully unlocked
- **Error** - Something went wrong

---

## Visibility Function (Recommended)

Use this to show the component only for logged-in users who have completed the hälsodeklaration:

```javascript
try {
  // Only show for logged-in users
  if (!window.$store || !window.$store.state || !window.$store.state.user) {
    return false;
  }
  // Only show if hälsodeklaration is completed
  var user = window.$store.state.user;
  if (!user.xf || user.xf.halsodeklaration !== true) {
    return false;
  }
  return true;
} catch (error) {
  console.error('PelviX visibility check error:', error);
  return false;
}
```

---

## Server-Side Enforcement

In addition to the visibility function (which is UX-only), the server also enforces the hälsodeklaration check. If a user somehow accesses the PelviX Starter without completing the form, the `POST /api/start-pelvix` endpoint will return a 403 error with the message:

> "Du måste fylla i hälsodeklarationen innan du kan starta PelviX."

---

## Page Layout

On the PelviX page, place both components:
1. **Hälsodeklaration** (visible when `xf.halsodeklaration !== true`) - shows the form
2. **PelviX Starter** (visible when `xf.halsodeklaration === true`) - shows the device control

Only one will be visible at a time based on the user's hälsodeklaration status.

---

*Last updated: 2026-03-07*
