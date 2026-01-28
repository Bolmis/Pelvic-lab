# PelviX Starter Component - Visibility Function

**Component:** `zoezi-pelvix-starter`
**Purpose:** Show the PelviX starter component only when the user has a resourcebooking starting within 5 minutes
**Type:** Visibility Function for Zoezi Page Builder

---

## Usage

Copy this visibility function into the Zoezi Page Builder component visibility settings for the `zoezi-pelvix-starter` component.

---

## Visibility Function

```javascript
try {
  console.log('=== PELVIX STARTER VISIBILITY CHECK ===');

  // Check if user is logged in
  if (!window.$store || !window.$store.state || !window.$store.state.user) {
    console.log('User not logged in - hiding PelviX starter');
    return false;
  }

  const user = window.$store.state.user;
  console.log('User logged in:', user.firstName || user.email);

  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  console.log('Current time (local):', now.toLocaleString('sv-SE'));
  console.log('Window ends at (local):', fiveMinutesFromNow.toLocaleString('sv-SE'));

  const cacheKey = 'pelvix_upcoming_booking_' + user.id;
  const cachedData = localStorage.getItem(cacheKey);

  let hasUpcomingBooking = false;
  let shouldRefresh = true;
  let isFirstLoad = true;

  if (cachedData) {
    try {
      const cached = JSON.parse(cachedData);
      const cacheAge = now.getTime() - cached.timestamp;
      isFirstLoad = false;

      // Cache valid for 30 seconds
      if (cacheAge < 30000) {
        console.log('Using cached booking data (age: ' + Math.round(cacheAge / 1000) + 's)');
        hasUpcomingBooking = cached.hasUpcomingBooking;
        shouldRefresh = false;
      }
    } catch (e) {
      console.log('Cache parse error, will refresh');
    }
  }

  // Refresh bookings data in background
  if (shouldRefresh && window.$zoeziapi) {
    console.log('Fetching fresh booking data...');

    // Format dates for API (YYYY-MM-DD) in local timezone
    const today = now.getFullYear() + '-' +
                  String(now.getMonth() + 1).padStart(2, '0') + '-' +
                  String(now.getDate()).padStart(2, '0');
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.getFullYear() + '-' +
                        String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' +
                        String(tomorrow.getDate()).padStart(2, '0');

    window.$zoeziapi.get('/api/memberapi/bookings/get', {
      startTime: today,
      endTime: tomorrowStr
    }).then(function(bookings) {
      console.log('Bookings response:', bookings);

      let foundUpcoming = false;
      const checkTime = new Date();
      const checkFiveMin = new Date(checkTime.getTime() + 5 * 60 * 1000);

      // Check resource bookings
      if (bookings && bookings.resourcebookings && Array.isArray(bookings.resourcebookings)) {
        bookings.resourcebookings.forEach(function(category) {
          if (category.bookings && Array.isArray(category.bookings)) {
            category.bookings.forEach(function(booking) {
              if (booking.cancelled) return;

              // Parse booking time - API returns local time as 'YYYY-MM-DD HH:MM:SS'
              // Replace space with T to make it ISO-like, browser will parse as local time
              const timeStr = booking.time.replace(' ', 'T');
              const bookingTime = new Date(timeStr);

              console.log('Checking booking:', category.name || booking.servicename);
              console.log('  Booking time (local):', bookingTime.toLocaleString('sv-SE'));
              console.log('  Now (local):', checkTime.toLocaleString('sv-SE'));
              console.log('  Window ends (local):', checkFiveMin.toLocaleString('sv-SE'));

              // Check if booking starts within 5 minutes (now <= bookingTime <= now + 5min)
              if (bookingTime >= checkTime && bookingTime <= checkFiveMin) {
                console.log('*** FOUND UPCOMING BOOKING WITHIN 5 MINUTES ***');
                foundUpcoming = true;
              } else {
                const diffMs = bookingTime.getTime() - checkTime.getTime();
                const diffMin = Math.round(diffMs / 60000);
                console.log('  Time until booking:', diffMin, 'minutes');
              }
            });
          }
        });
      }

      // Update cache
      const previousValue = hasUpcomingBooking;
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: checkTime.getTime(),
        hasUpcomingBooking: foundUpcoming
      }));

      console.log('Cache updated. Has upcoming booking:', foundUpcoming);

      // If state changed or this was first load, force page to re-evaluate visibility
      if (foundUpcoming !== previousValue || isFirstLoad) {
        console.log('Triggering visibility re-evaluation...');
        // Dispatch event that Zoezi page builder listens to for re-rendering
        window.dispatchEvent(new CustomEvent('zoezi-visibility-update'));
        // Also try forcing Vue reactivity update
        if (window.$store && window.$store.commit) {
          window.$store.commit('forceUpdate');
        }
        // Fallback: trigger resize event which often causes re-render
        window.dispatchEvent(new Event('resize'));
      }

    }).catch(function(error) {
      console.error('Error fetching bookings:', error);
    });
  }

  // On first load (no cache), show component while we fetch data
  // This prevents the component from flickering hide->show
  if (isFirstLoad) {
    console.log('=== VISIBILITY RESULT: SHOW (first load, fetching data...) ===');
    return true;
  }

  console.log('=== VISIBILITY RESULT:', hasUpcomingBooking ? 'SHOW' : 'HIDE', '===');
  return hasUpcomingBooking;

} catch (error) {
  console.error('Error in PelviX starter visibility check:', error);
  return false;
}
```

---

## How It Works

1. **Authentication Check**: First verifies the user is logged in via `window.$store.state.user`

2. **First Load Behavior**: On first load (no cache), shows the component while fetching data to prevent flicker

3. **Caching Strategy**: Since visibility functions run frequently and should be fast:
   - Uses localStorage to cache booking status
   - Cache is valid for 30 seconds
   - Background refresh happens when cache expires
   - After async fetch completes, triggers visibility re-evaluation

4. **Booking Check Logic**:
   - Fetches today's bookings via `/api/memberapi/bookings/get`
   - Parses booking times correctly as local time (fixes timezone issues)
   - Iterates through all resource booking categories
   - Checks if any non-cancelled booking starts within 5 minutes of current time

5. **Time Window**: Shows component when:
   - Current time <= Booking start time <= Current time + 5 minutes

---

## Testing

To test this visibility function:

1. Create a resource booking for yourself that starts within 5 minutes
2. Navigate to the page with the PelviX starter component
3. Open browser console to see debug logs
4. The component should appear when you have an upcoming booking

**Console Debug Output:**
```
=== PELVIX STARTER VISIBILITY CHECK ===
User logged in: Anton
Current time (local): 2026-01-28 10:00:00
Window ends at (local): 2026-01-28 10:05:00
=== VISIBILITY RESULT: SHOW (first load, fetching data...) ===
Fetching fresh booking data...
Bookings response: {workouts: [...], resourcebookings: [...]}
Checking booking: PelviX
  Booking time (local): 2026-01-28 10:03:00
  Now (local): 2026-01-28 10:00:05
  Window ends (local): 2026-01-28 10:05:05
*** FOUND UPCOMING BOOKING WITHIN 5 MINUTES ***
Cache updated. Has upcoming booking: true
Triggering visibility re-evaluation...
```

---

## Notes

- The 5-minute window ensures users can only start the device when their booked session is about to begin
- The 30-second cache prevents excessive API calls while still being responsive
- Debug logging can be removed in production by deleting the `console.log` statements

---

*Last updated: 2026-01-28*
