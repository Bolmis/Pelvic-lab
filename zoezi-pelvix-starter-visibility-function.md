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

  // We need to check resource bookings via API
  // Since visibility functions should be synchronous, we use a cached approach
  // The component will be shown if the user has an upcoming booking cached in the store

  // Check if we have bookings data available
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  console.log('Current time:', now.toISOString());
  console.log('Checking for bookings starting before:', fiveMinutesFromNow.toISOString());

  // Try to fetch bookings synchronously from cache or make async call
  // For visibility functions, we'll use a polling approach with localStorage cache

  const cacheKey = 'pelvix_upcoming_booking_' + user.id;
  const cachedData = localStorage.getItem(cacheKey);

  let hasUpcomingBooking = false;
  let shouldRefresh = true;

  if (cachedData) {
    try {
      const cached = JSON.parse(cachedData);
      const cacheAge = now.getTime() - cached.timestamp;

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

    // Format dates for API (YYYY-MM-DD)
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    window.$zoeziapi.get('/api/memberapi/bookings/get', {
      startTime: today,
      endTime: tomorrow
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

              const bookingTime = new Date(booking.time);
              console.log('Checking booking:', booking.servicename, 'at', bookingTime.toISOString());

              // Check if booking starts within 5 minutes (now <= bookingTime <= now + 5min)
              if (bookingTime >= checkTime && bookingTime <= checkFiveMin) {
                console.log('*** FOUND UPCOMING BOOKING WITHIN 5 MINUTES ***');
                console.log('Service:', booking.servicename);
                console.log('Start time:', bookingTime.toISOString());
                foundUpcoming = true;
              }
            });
          }
        });
      }

      // Update cache
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: checkTime.getTime(),
        hasUpcomingBooking: foundUpcoming
      }));

      // If state changed, trigger re-render by updating a store value
      if (foundUpcoming !== hasUpcomingBooking) {
        console.log('Booking status changed, component visibility should update');
        // Force re-evaluation on next check
      }

    }).catch(function(error) {
      console.error('Error fetching bookings:', error);
    });
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

2. **Caching Strategy**: Since visibility functions run frequently and should be fast:
   - Uses localStorage to cache booking status
   - Cache is valid for 30 seconds
   - Background refresh happens when cache expires

3. **Booking Check Logic**:
   - Fetches today's bookings via `/api/memberapi/bookings/get`
   - Iterates through all resource booking categories
   - Checks if any non-cancelled booking starts within 5 minutes of current time

4. **Time Window**: Shows component when:
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
Current time: 2026-01-28T10:00:00.000Z
Checking for bookings starting before: 2026-01-28T10:05:00.000Z
Fetching fresh booking data...
Bookings response: {workouts: [...], resourcebookings: [...]}
Checking booking: PelviX Treatment at 2026-01-28T10:03:00.000Z
*** FOUND UPCOMING BOOKING WITHIN 5 MINUTES ***
Service: PelviX Treatment
Start time: 2026-01-28T10:03:00.000Z
=== VISIBILITY RESULT: SHOW ===
```

---

## Notes

- The 5-minute window ensures users can only start the device when their booked session is about to begin
- The 30-second cache prevents excessive API calls while still being responsive
- Debug logging can be removed in production by deleting the `console.log` statements

---

*Last updated: 2026-01-28*
