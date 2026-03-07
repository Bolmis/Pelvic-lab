# PelviX Starter Component - Visibility Function

**Component:** `zoezi-pelvix-starter`
**Purpose:** Control visibility of the PelviX starter component
**Type:** Visibility Function for Zoezi Page Builder

---

## Overview

The PelviX Starter component requires the user to have completed the Hälsodeklaration (health declaration form) before it allows starting the device. Since the Zoezi member API (`/api/memberapi/get/current`) does not include extra fields (`xf`), the hälsodeklaration check is done server-side via `GET /api/check-halsodeklaration?userId=X`.

Both the component and the server enforce this check:
1. **Component:** Calls the server endpoint on load, shows "Hälsodeklaration krävs" message if not completed
2. **Server:** The `POST /api/start-pelvix` endpoint independently verifies `xf.halsodeklaration` via the Zoezi API key

The component handles these states internally:
- **Loading** - While checking hälsodeklaration and fetching bookings
- **Hälsodeklaration required** - User has not completed the health declaration
- **No booking** - User has no upcoming booking within 5 minutes
- **Ready** - User has a booking starting within 5 minutes, can start the device
- **Started** - Device successfully unlocked
- **Error** - Something went wrong

---

## Visibility Function (Optional)

Since the component handles all states internally (including the hälsodeklaration check),
no visibility function is strictly needed. Optionally, add a simple login check:

```javascript
try {
  if (!window.$store || !window.$store.state || !window.$store.state.user) {
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

The server enforces the hälsodeklaration check at two levels:

1. **`GET /api/check-halsodeklaration?userId=X`** - Returns `{ completed: true/false }` for UI gating
2. **`POST /api/start-pelvix`** - Returns 403 if `xf.halsodeklaration` is not true:
   > "Du måste fylla i hälsodeklarationen innan du kan starta PelviX."

Both use the Zoezi API key to call `/api/user/get/{userId}` which includes the `xf` fields.

---

## Page Layout

On the PelviX page, place both components:
1. **Hälsodeklaration** - shows the form if not completed, renders empty if completed
2. **PelviX Starter** - shows "Hälsodeklaration krävs" if not completed, shows device control if completed

Both components independently check the server. Only the relevant UI is visible at any time.

---

*Last updated: 2026-03-07*
