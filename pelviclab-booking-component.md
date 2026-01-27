# Pelvic Lab PelviX Booking Component - COMPLETE (Copy-Paste Ready)

**Component Type:** User-Facing Booking Component
**Purpose:** Allow users to book PelviX treatments with calendar selection
**Access Level:** Public (with login for checkout)
**Zoezi Domain:** pelviclab.zoezi.se

---

## Features

- Premium white/gray/gold design
- Service selection (PelviX första gången, PelviX)
- Interactive calendar with available dates
- Time slot selection
- Inline Zoezi checkout (not modal)
- Mobile responsive
- Confirmation modal

---

## Services Configuration

```javascript
// Available services from Zoezi
const services = [
  { id: 1, name: "PelviX första gången", duration: 30, description: "Introduktionsbehandling för nya kunder" },
  { id: 2, name: "PelviX", duration: 30, description: "Ordinarie PelviX-behandling" }
];

// Resource (room)
const resource = { id: 6, name: "PelviX-rum", type: "resource", resourceType: "room" };
```

---

## Installation in Zoezi

1. Go to Zoezi Admin Panel
2. Navigate to Components > Create New Component
3. Name: "PelviX Bokning"
4. Copy the complete HTML, JavaScript, and CSS below
5. Save and publish

---

## HTML

```html
<div class="pl-booking-container">
  <!-- Loading Overlay -->
  <div v-if="loading" class="pl-loading-overlay">
    <div class="pl-loading">
      <div class="pl-spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>
  </div>

  <!-- Error State -->
  <div v-if="error && !loading" class="pl-error">
    <div class="pl-error-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <p>{{ error }}</p>
    <button @click="clearError" class="pl-button pl-button-secondary">Försök igen</button>
  </div>

  <!-- Main Booking Flow -->
  <div v-if="!loading && !error && !showCheckoutSection">

    <!-- Hero Section -->
    <div class="pl-hero">
      <div class="pl-hero-content">
        <div class="pl-hero-badge">Medicinsk Bäckenbottenträning</div>
        <h1 class="pl-hero-title">Boka PelviX</h1>
        <p class="pl-hero-subtitle">Stärk din bäckenbotten på 22 minuter - helt utan fysisk ansträngning</p>
      </div>
      <div class="pl-hero-accent"></div>
    </div>

    <!-- Step 1: Service Selection -->
    <div v-if="currentStep === 'service'" class="pl-step pl-step-service">
      <div class="pl-step-header">
        <span class="pl-step-number">1</span>
        <h2 class="pl-step-title">Välj behandling</h2>
      </div>

      <div class="pl-services-grid">
        <div
          v-for="service in availableServices"
          :key="service.id"
          class="pl-service-card"
          :class="{ 'pl-selected': selectedService && selectedService.id === service.id }"
          @click="selectService(service)"
        >
          <div class="pl-service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <div class="pl-service-content">
            <h3 class="pl-service-name">{{ service.name }}</h3>
            <p class="pl-service-description">{{ service.description || 'PelviX-behandling i vår studio' }}</p>
            <div class="pl-service-meta">
              <span class="pl-service-duration">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {{ service.duration }} min
              </span>
            </div>
          </div>
          <div class="pl-service-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Calendar -->
    <div v-if="currentStep === 'calendar'" class="pl-step pl-step-calendar">
      <!-- Selection Summary -->
      <div class="pl-selection-summary">
        <div class="pl-summary-item" @click="goToStep('service')">
          <div class="pl-summary-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div class="pl-summary-text">
            <span class="pl-summary-label">Behandling</span>
            <span class="pl-summary-value">{{ selectedService.name }}</span>
          </div>
          <span class="pl-summary-edit">Ändra</span>
        </div>
      </div>

      <div class="pl-step-header">
        <span class="pl-step-number">2</span>
        <h2 class="pl-step-title">Välj datum</h2>
      </div>

      <div v-if="loadingCalendar" class="pl-loading-inline">
        <div class="pl-spinner-small"></div>
        <p>Laddar tillgängliga datum...</p>
      </div>

      <div v-else class="pl-calendar-wrapper">
        <div class="pl-calendar">
          <div class="pl-calendar-header">
            <button @click="previousMonth" class="pl-month-nav" :disabled="!canGoPrevious">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h3 class="pl-month-title">{{ currentMonthName }} {{ currentYear }}</h3>
            <button @click="nextMonth" class="pl-month-nav">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div class="pl-calendar-grid">
            <div class="pl-weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
            <div
              v-for="(date, index) in calendarDates"
              :key="index"
              class="pl-calendar-day"
              :class="{
                'pl-empty': !date.day,
                'pl-available': date.available,
                'pl-selected': selectedDate === date.dateString,
                'pl-today': date.isToday,
                'pl-disabled': date.day && !date.available
              }"
              @click="date.available && selectDate(date.dateString)"
            >
              <span v-if="date.day" class="pl-day-number">{{ date.day }}</span>
              <span v-if="date.available" class="pl-day-dot"></span>
            </div>
          </div>
        </div>

        <div class="pl-calendar-legend">
          <div class="pl-legend-item">
            <span class="pl-legend-dot pl-legend-available"></span>
            <span>Lediga tider</span>
          </div>
          <div class="pl-legend-item">
            <span class="pl-legend-dot pl-legend-selected"></span>
            <span>Valt datum</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Time Selection -->
    <div v-if="currentStep === 'time'" class="pl-step pl-step-time">
      <!-- Selection Summary -->
      <div class="pl-selection-summary">
        <div class="pl-summary-item" @click="goToStep('service')">
          <div class="pl-summary-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div class="pl-summary-text">
            <span class="pl-summary-label">Behandling</span>
            <span class="pl-summary-value">{{ selectedService.name }}</span>
          </div>
          <span class="pl-summary-edit">Ändra</span>
        </div>
        <div class="pl-summary-divider"></div>
        <div class="pl-summary-item" @click="goToStep('calendar')">
          <div class="pl-summary-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="pl-summary-text">
            <span class="pl-summary-label">Datum</span>
            <span class="pl-summary-value">{{ formatDateDisplay(selectedDate) }}</span>
          </div>
          <span class="pl-summary-edit">Ändra</span>
        </div>
      </div>

      <div class="pl-step-header">
        <span class="pl-step-number">3</span>
        <h2 class="pl-step-title">Välj tid</h2>
      </div>

      <div v-if="loadingTimes" class="pl-loading-inline">
        <div class="pl-spinner-small"></div>
        <p>Laddar tillgängliga tider...</p>
      </div>

      <div v-else-if="availableTimes.length === 0" class="pl-no-times">
        <div class="pl-no-times-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <p>Inga tillgängliga tider för valt datum.</p>
        <button @click="goToStep('calendar')" class="pl-button pl-button-secondary">Välj annat datum</button>
      </div>

      <div v-else class="pl-times-grid">
        <button
          v-for="slot in availableTimes"
          :key="slot.start"
          class="pl-time-slot"
          :class="{ 'pl-selected': selectedTime && selectedTime.start === slot.start }"
          @click="selectTime(slot)"
        >
          <span class="pl-time-value">{{ formatTime(slot.start) }}</span>
        </button>
      </div>

      <div v-if="selectedTime" class="pl-continue-section">
        <button @click="proceedToCheckout" class="pl-button pl-button-primary pl-button-large">
          Fortsätt till bokning
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Checkout Section (Inline, not modal) -->
  <div v-if="showCheckoutSection" class="pl-checkout-section">
    <div class="pl-checkout-header">
      <h2>Slutför din bokning</h2>
    </div>

    <div class="pl-checkout-summary">
      <div class="pl-checkout-summary-row">
        <span class="pl-checkout-label">Behandling</span>
        <span class="pl-checkout-value">{{ selectedService.name }}</span>
      </div>
      <div class="pl-checkout-summary-row">
        <span class="pl-checkout-label">Datum</span>
        <span class="pl-checkout-value">{{ formatDateDisplay(selectedDate) }}</span>
      </div>
      <div class="pl-checkout-summary-row">
        <span class="pl-checkout-label">Tid</span>
        <span class="pl-checkout-value">{{ formatTime(selectedTime.start) }}</span>
      </div>
      <div class="pl-checkout-summary-row">
        <span class="pl-checkout-label">Längd</span>
        <span class="pl-checkout-value">{{ selectedService.duration }} minuter</span>
      </div>
    </div>

    <div class="pl-checkout-content">
      <zoezi-checkout
        ref="checkout"
        :items="checkoutItems"
        :dialog="false"
        :show-back-link="false"
        :new-style-done-dialog="false"
        @done="onCheckoutComplete"
        @almostdone="onCheckoutComplete"
        @close="resetSelection"
      />
    </div>

    <!-- Back button -->
    <button
      class="pl-back-button-large"
      @click="resetSelection"
      v-if="!checkoutCompleted && !checkoutLoading">
      ← Tillbaka till val
    </button>
  </div>

  <!-- Confirmation Modal -->
  <div v-if="showConfirmation" class="pl-confirmation-overlay">
    <div class="pl-confirmation-modal">
      <div class="pl-confirmation-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h2 class="pl-confirmation-title">Tack för din bokning!</h2>
      <p class="pl-confirmation-message">Din bokning är bekräftad. Vi ser fram emot att välkomna dig till Pelvic Lab.</p>

      <div v-if="orderDetails" class="pl-confirmation-details">
        <h3>Din bokning:</h3>
        <p><strong>{{ selectedService.name }}</strong></p>
        <p>{{ formatDateDisplay(selectedDate) }} kl {{ formatTime(selectedTime.start) }}</p>
      </div>

      <div class="pl-confirmation-info">
        <div class="pl-info-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <p>Du kommer sitta bekvämt och fullt påklädd under hela behandlingen.</p>
      </div>

      <div class="pl-confirmation-actions">
        <a href="/minasidor" class="pl-button pl-button-primary">Mina sidor</a>
        <button @click="closeConfirmation" class="pl-button pl-button-secondary">Stäng</button>
      </div>
    </div>
  </div>
</div>
```

---

## JavaScript

```javascript
export default {
  name: 'pelviclab-booking',

  zoezi: {
    title: 'Pelvic Lab PelviX Bokning',
    icon: 'mdi-calendar-heart'
  },

  props: {
    daysAhead: {
      title: 'Days ahead to show',
      type: Number,
      default: 90
    }
  },

  data() {
    return {
      loading: false,
      loadingMessage: 'Laddar...',
      loadingCalendar: false,
      loadingTimes: false,
      error: null,

      // Steps: service -> calendar -> time
      currentStep: 'service',

      // Services - loaded from API with fallback
      availableServices: [],
      selectedService: null,
      fullServiceData: [], // Store full service objects for checkout

      // Calendar state
      currentMonth: new Date(),
      calendarDates: [],
      selectedDate: null,
      weekdays: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
      availabilityByDate: {}, // Store available slots per date

      // Time slots
      availableTimes: [],
      selectedTime: null,

      // Checkout
      showCheckoutSection: false,
      checkoutItems: [],
      checkoutCompleted: false,
      checkoutLoading: false,

      // Confirmation
      showConfirmation: false,
      orderDetails: null
    };
  },

  computed: {
    currentMonthName() {
      const months = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
                      'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
      return months[this.currentMonth.getMonth()];
    },

    currentYear() {
      return this.currentMonth.getFullYear();
    },

    canGoPrevious() {
      const today = new Date();
      const currentMonthStart = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return currentMonthStart > thisMonthStart;
    }
  },

  async mounted() {
    await this.fetchServices();
  },

  methods: {
    // Format date as YYYY-MM-DD
    formatDateISO(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // Fetch available services from API
    async fetchServices() {
      this.loading = true;
      this.loadingMessage = 'Laddar behandlingar...';

      try {
        const response = await window.$zoeziapi.get('/api/public/resourcebooking/service/get');

        let services = Array.isArray(response) ? response : [response];
        services = services.filter(service => service.active && service.show);

        // Store full service data for checkout
        this.fullServiceData = services;

        this.availableServices = services.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || s.longdescription || null,
          duration: s.duration,
          staffs: s.staffs || []
        }));

        console.log(`Loaded ${this.availableServices.length} services`);

      } catch (err) {
        console.error('Error fetching services:', err);
        // Fallback to hardcoded services
        this.availableServices = [
          { id: 1, name: "PelviX första gången", duration: 30, description: "Introduktionsbehandling för nya kunder", staffs: [{ id: 6 }] },
          { id: 2, name: "PelviX", duration: 30, description: "Ordinarie PelviX-behandling", staffs: [{ id: 6 }] }
        ];
        this.fullServiceData = this.availableServices;
      } finally {
        this.loading = false;
      }
    },

    // Service selection
    selectService(service) {
      this.selectedService = service;
      this.currentStep = 'calendar';
      this.loadCalendarAvailability();
    },

    // Load calendar availability using /api/public/resourcebooking/get
    async loadCalendarAvailability() {
      if (!this.selectedService) return;

      this.loadingCalendar = true;
      this.availabilityByDate = {};

      try {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const startStr = this.formatDateISO(startDate);
        const endStr = this.formatDateISO(endDate);

        // Get staff IDs from service
        const staffIds = this.selectedService.staffs
          ? this.selectedService.staffs.map(s => s.id).join(',')
          : '';

        console.log(`Fetching availability for service ${this.selectedService.id} from ${startStr} to ${endStr}`);

        const response = await window.$zoeziapi.get('/api/public/resourcebooking/get', {
          service: this.selectedService.id,
          start: startStr,
          end: endStr,
          staffs: staffIds
        });

        // Process response - group by date
        if (response && Array.isArray(response)) {
          response.forEach(slot => {
            const slotDate = slot.start.split(' ')[0];
            if (!this.availabilityByDate[slotDate]) {
              this.availabilityByDate[slotDate] = [];
            }
            this.availabilityByDate[slotDate].push(slot);
          });
        }

        console.log(`Found availability for ${Object.keys(this.availabilityByDate).length} dates`);

        this.buildCalendarGrid();

      } catch (err) {
        console.error('Error loading calendar availability:', err);
        this.buildCalendarGrid();
      } finally {
        this.loadingCalendar = false;
      }
    },

    buildCalendarGrid() {
      const dates = [];
      const year = this.currentMonth.getFullYear();
      const month = this.currentMonth.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Get the day of week (0 = Sunday, adjust to Monday = 0)
      let startDayOfWeek = firstDay.getDay();
      startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

      // Add empty cells for days before the first
      for (let i = 0; i < startDayOfWeek; i++) {
        dates.push({ day: null, dateString: null, available: false });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Add days of the month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateString = this.formatDateISO(date);
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();

        // Check if there are available slots for this date
        const hasSlots = this.availabilityByDate[dateString] && this.availabilityByDate[dateString].length > 0;
        const available = !isPast && hasSlots;

        dates.push({
          day,
          dateString,
          available,
          isToday
        });
      }

      this.calendarDates = dates;
    },

    previousMonth() {
      if (!this.canGoPrevious) return;
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
      this.loadCalendarAvailability();
    },

    nextMonth() {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
      this.loadCalendarAvailability();
    },

    selectDate(dateString) {
      this.selectedDate = dateString;
      this.currentStep = 'time';
      this.loadTimeSlots();
    },

    // Load time slots for selected date
    async loadTimeSlots() {
      if (!this.selectedService || !this.selectedDate) return;

      this.loadingTimes = true;
      this.availableTimes = [];
      this.selectedTime = null;

      try {
        // Get staff IDs from service
        const staffIds = this.selectedService.staffs
          ? this.selectedService.staffs.map(s => s.id).join(',')
          : '';

        const response = await window.$zoeziapi.get('/api/public/resourcebooking/get', {
          service: this.selectedService.id,
          start: this.selectedDate,
          end: this.selectedDate,
          staffs: staffIds
        });

        if (response && Array.isArray(response)) {
          // Filter slots for selected date and sort by time
          this.availableTimes = response
            .filter(slot => slot.start.split(' ')[0] === this.selectedDate)
            .map(slot => ({
              start: slot.start,
              end: slot.end,
              staffId: slot.staffs && slot.staffs.length > 0 ? slot.staffs[0] : null,
              staff: slot.staffs
            }))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        }

        console.log(`Loaded ${this.availableTimes.length} time slots for ${this.selectedDate}`);

      } catch (err) {
        console.error('Error loading time slots:', err);
        this.error = 'Kunde inte ladda tillgängliga tider. Försök igen.';
      } finally {
        this.loadingTimes = false;
      }
    },

    selectTime(slot) {
      this.selectedTime = slot;
    },

    // Navigation
    goToStep(step) {
      this.currentStep = step;
      if (step === 'calendar' && this.selectedService) {
        this.loadCalendarAvailability();
      }
    },

    // Generate random booking ID (for checkout)
    getRandomBookingId() {
      return 'plb-' + Math.random().toString(36).substring(2, 11);
    },

    // Proceed to checkout - reserve the time slot first
    async proceedToCheckout() {
      if (!this.selectedService || !this.selectedDate || !this.selectedTime) return;

      this.loading = true;
      this.loadingMessage = 'Reserverar tid...';

      try {
        // Format datetime for reservation
        const formatDateTime = (dateTimeStr) => {
          return dateTimeStr; // Already in correct format from API
        };

        // Get full service object
        const fullService = this.fullServiceData.find(s => s.id === this.selectedService.id) || this.selectedService;

        const booking = {
          start: formatDateTime(this.selectedTime.start),
          end: formatDateTime(this.selectedTime.end),
          rbservice_id: this.selectedService.id,
          staff_id: this.selectedTime.staffId,
          site_id: 1,
          reserving: true,
          optional_resources: [],
          count: 1
        };

        const reservation = {
          bookings: [booking],
          key: null,
          replace: true,
          basket: {}
        };

        const response = await window.$zoeziapi.post('/api/resource/reservation/add_resourcebooking', reservation);

        if (!response.ok) {
          throw new Error('Reservation failed');
        }

        const data = await response.json();
        const reservationKey = data.key;

        // Build checkout items
        const bookingTmpId = this.getRandomBookingId() + '-1';

        const slot = {
          start: this.selectedTime.start,
          end: this.selectedTime.end,
          staff_id: this.selectedTime.staffId,
          rbservice_id: this.selectedService.id,
          site_id: 1,
          optional_resources: [],
          count: 1
        };

        this.checkoutItems = [{
          count: 1,
          rbservice_id: this.selectedService.id,
          service: {
            id: fullService.id,
            name: fullService.name,
            price: fullService.price,
            imagekey: fullService.imagekey,
            duration: fullService.duration,
            description: fullService.description,
            extendedInfo: fullService.extendedInfo || [],
            staffs: fullService.staffs,
            sites: fullService.sites || [1],
            vat: fullService.vat,
            methods: fullService.methods || []
          },
          reservation: reservationKey,
          slots: [slot],
          extra_person: [],
          extended_info: {},
          extended_info_list: [{}],
          context: null,
          tmp_id: bookingTmpId,
          site_id: 1
        }];

        console.log('Checkout items created:', this.checkoutItems);

        this.loading = false;
        this.showCheckoutSection = true;

        // Scroll to checkout section
        this.$nextTick(() => {
          const checkoutElement = document.querySelector('.pl-checkout-section');
          if (checkoutElement) {
            checkoutElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

      } catch (error) {
        console.error('Reservation failed:', error);
        this.error = 'Tiden kunde inte reserveras. Den kan redan vara bokad.';
        this.loading = false;
      }
    },

    // Reset selection and hide checkout
    resetSelection() {
      this.showCheckoutSection = false;
      this.checkoutCompleted = false;
      this.selectedTime = null;

      // Scroll back to time selection
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    onCheckoutComplete(result) {
      console.log('Checkout complete:', result);

      // Validate that this is an actual successful booking, not just a cart clear
      // The 'done' event is also emitted when clearing the cart, so we need to check
      if (!result) {
        // No result data - likely a cart clear, not a successful booking
        this.resetSelection();
        return;
      }

      // Check if we have actual order confirmation data
      const hasOrderData = result.orderconfirmation && result.orderconfirmation.length > 0;
      const hasOrderId = result.orderid || result.order_id;

      if (!hasOrderData && !hasOrderId) {
        // No order data - likely a cart clear or cancelled checkout
        this.resetSelection();
        return;
      }

      this.orderDetails = result;
      this.showCheckoutSection = false;
      this.checkoutCompleted = true;
      this.showConfirmation = true;
    },

    closeConfirmation() {
      this.showConfirmation = false;
      this.resetBooking();
    },

    resetBooking() {
      this.currentStep = 'service';
      this.selectedService = null;
      this.selectedDate = null;
      this.selectedTime = null;
      this.availableTimes = [];
      this.checkoutItems = [];
      this.orderDetails = null;
      this.showCheckoutSection = false;
      this.checkoutCompleted = false;

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    clearError() {
      this.error = null;
    },

    formatDateDisplay(dateString) {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni',
                      'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
      return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    },

    formatTime(timeString) {
      if (!timeString) return '';
      // Handle both "YYYY-MM-DD HH:MM" and "HH:MM" formats
      if (timeString.includes(' ')) {
        return timeString.split(' ')[1].substring(0, 5);
      }
      return timeString.substring(0, 5);
    }
  }
};
```

---

## CSS

```css
/* ========================================
   PELVIC LAB BOOKING COMPONENT
   Premium Design: White, Gray, Gold
   ======================================== */

/* CSS Variables */
.pl-booking-container {
  --pl-gold: #C9A962;
  --pl-gold-light: #E8D5A8;
  --pl-gold-dark: #9A7B3A;
  --pl-white: #FFFFFF;
  --pl-gray-50: #FAFAFA;
  --pl-gray-100: #F5F5F5;
  --pl-gray-200: #EEEEEE;
  --pl-gray-300: #E0E0E0;
  --pl-gray-400: #BDBDBD;
  --pl-gray-500: #9E9E9E;
  --pl-gray-600: #757575;
  --pl-gray-700: #616161;
  --pl-gray-800: #424242;
  --pl-gray-900: #212121;
  --pl-text: #1A1A1A;
  --pl-text-light: #666666;
  --pl-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --pl-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --pl-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --pl-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --pl-radius: 12px;
  --pl-radius-lg: 16px;
  --pl-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Container */
.pl-booking-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: var(--pl-white);
  color: var(--pl-text);
  line-height: 1.6;
}

/* Hero Section */
.pl-hero {
  position: relative;
  background: linear-gradient(135deg, var(--pl-gray-900) 0%, var(--pl-gray-800) 100%);
  border-radius: var(--pl-radius-lg);
  padding: 48px 32px;
  margin-bottom: 32px;
  overflow: hidden;
}

.pl-hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.pl-hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--pl-gold) 0%, var(--pl-gold-light) 100%);
  color: var(--pl-gray-900);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.pl-hero-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--pl-white);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.pl-hero-subtitle {
  font-size: 16px;
  color: var(--pl-gray-400);
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
}

.pl-hero-accent {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--pl-gold) 0%, transparent 70%);
  opacity: 0.1;
  pointer-events: none;
}

/* Step Header */
.pl-step-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.pl-step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--pl-gold) 0%, var(--pl-gold-dark) 100%);
  color: var(--pl-white);
  font-size: 16px;
  font-weight: 700;
  border-radius: 50%;
}

.pl-step-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--pl-gray-900);
  margin: 0;
}

/* Service Cards */
.pl-services-grid {
  display: grid;
  gap: 16px;
}

.pl-service-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--pl-white);
  border: 2px solid var(--pl-gray-200);
  border-radius: var(--pl-radius);
  padding: 24px;
  cursor: pointer;
  transition: var(--pl-transition);
  position: relative;
}

.pl-service-card:hover {
  border-color: var(--pl-gold-light);
  box-shadow: var(--pl-shadow);
  transform: translateY(-2px);
}

.pl-service-card.pl-selected {
  border-color: var(--pl-gold);
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.05) 0%, rgba(201, 169, 98, 0.1) 100%);
  box-shadow: var(--pl-shadow-lg);
}

.pl-service-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--pl-gray-100) 0%, var(--pl-gray-200) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pl-service-card.pl-selected .pl-service-icon {
  background: linear-gradient(135deg, var(--pl-gold-light) 0%, var(--pl-gold) 100%);
}

.pl-service-icon svg {
  width: 28px;
  height: 28px;
  stroke: var(--pl-gray-600);
}

.pl-service-card.pl-selected .pl-service-icon svg {
  stroke: var(--pl-white);
}

.pl-service-content {
  flex: 1;
}

.pl-service-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--pl-gray-900);
  margin: 0 0 4px 0;
}

.pl-service-description {
  font-size: 14px;
  color: var(--pl-gray-600);
  margin: 0 0 12px 0;
}

.pl-service-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pl-service-duration {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--pl-gray-500);
}

.pl-service-check {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: var(--pl-gray-200);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--pl-transition);
}

.pl-service-card.pl-selected .pl-service-check {
  opacity: 1;
  background: var(--pl-gold);
}

.pl-service-check svg {
  width: 18px;
  height: 18px;
  stroke: var(--pl-white);
}

/* Selection Summary */
.pl-selection-summary {
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius);
  padding: 16px;
  margin-bottom: 24px;
}

.pl-summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--pl-transition);
}

.pl-summary-item:hover {
  background: var(--pl-gray-100);
}

.pl-summary-icon {
  width: 40px;
  height: 40px;
  background: var(--pl-white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--pl-shadow-sm);
}

.pl-summary-icon svg {
  width: 20px;
  height: 20px;
  stroke: var(--pl-gold);
}

.pl-summary-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pl-summary-label {
  font-size: 12px;
  color: var(--pl-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pl-summary-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--pl-gray-900);
}

.pl-summary-edit {
  font-size: 13px;
  color: var(--pl-gold);
  font-weight: 500;
}

.pl-summary-divider {
  height: 1px;
  background: var(--pl-gray-200);
  margin: 8px 0;
}

/* Calendar */
.pl-calendar-wrapper {
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius-lg);
  padding: 24px;
}

.pl-calendar {
  background: var(--pl-white);
  border-radius: var(--pl-radius);
  padding: 20px;
  box-shadow: var(--pl-shadow-sm);
}

.pl-calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--pl-gray-200);
}

.pl-month-nav {
  width: 40px;
  height: 40px;
  background: var(--pl-white);
  border: 1px solid var(--pl-gray-200);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--pl-transition);
}

.pl-month-nav:hover:not(:disabled) {
  background: var(--pl-gray-100);
  border-color: var(--pl-gold);
}

.pl-month-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pl-month-nav svg {
  width: 20px;
  height: 20px;
  stroke: var(--pl-gray-700);
}

.pl-month-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--pl-gray-900);
  margin: 0;
}

.pl-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.pl-weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--pl-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 0;
}

.pl-calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--pl-transition);
  position: relative;
}

.pl-calendar-day.pl-empty {
  cursor: default;
}

.pl-calendar-day.pl-disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.pl-calendar-day.pl-available:hover {
  background: var(--pl-gray-100);
}

.pl-calendar-day.pl-selected {
  background: linear-gradient(135deg, var(--pl-gold) 0%, var(--pl-gold-dark) 100%);
}

.pl-calendar-day.pl-today .pl-day-number {
  font-weight: 700;
  color: var(--pl-gold);
}

.pl-day-number {
  font-size: 14px;
  font-weight: 500;
  color: var(--pl-gray-700);
}

.pl-calendar-day.pl-selected .pl-day-number {
  color: var(--pl-white);
}

.pl-calendar-day.pl-disabled .pl-day-number {
  color: var(--pl-gray-400);
}

.pl-day-dot {
  width: 4px;
  height: 4px;
  background: var(--pl-gold);
  border-radius: 50%;
  margin-top: 2px;
}

.pl-calendar-day.pl-selected .pl-day-dot {
  background: var(--pl-white);
}

/* Calendar Legend */
.pl-calendar-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
}

.pl-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--pl-gray-600);
}

.pl-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.pl-legend-available {
  background: var(--pl-gold);
}

.pl-legend-selected {
  background: linear-gradient(135deg, var(--pl-gold) 0%, var(--pl-gold-dark) 100%);
}

/* Time Slots */
.pl-times-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.pl-time-slot {
  background: var(--pl-white);
  border: 2px solid var(--pl-gray-200);
  border-radius: 10px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: var(--pl-transition);
}

.pl-time-slot:hover {
  border-color: var(--pl-gold-light);
  box-shadow: var(--pl-shadow);
}

.pl-time-slot.pl-selected {
  border-color: var(--pl-gold);
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.1) 0%, rgba(201, 169, 98, 0.15) 100%);
}

.pl-time-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--pl-gray-900);
}

.pl-time-slot.pl-selected .pl-time-value {
  color: var(--pl-gold-dark);
}

/* No Times */
.pl-no-times {
  text-align: center;
  padding: 48px 24px;
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius);
}

.pl-no-times-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.pl-no-times-icon svg {
  width: 100%;
  height: 100%;
  stroke: var(--pl-gray-400);
}

.pl-no-times p {
  color: var(--pl-gray-600);
  margin-bottom: 16px;
}

/* Continue Section */
.pl-continue-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--pl-gray-200);
  text-align: center;
}

/* Buttons */
.pl-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--pl-transition);
  border: none;
  text-decoration: none;
}

.pl-button-primary {
  background: linear-gradient(135deg, var(--pl-gold) 0%, var(--pl-gold-dark) 100%);
  color: var(--pl-white);
  box-shadow: var(--pl-shadow);
}

.pl-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--pl-shadow-lg);
}

.pl-button-secondary {
  background: var(--pl-white);
  color: var(--pl-gray-700);
  border: 2px solid var(--pl-gray-200);
}

.pl-button-secondary:hover {
  border-color: var(--pl-gold);
  color: var(--pl-gold-dark);
}

.pl-button-large {
  padding: 18px 36px;
  font-size: 16px;
}

/* Back Button */
.pl-back-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--pl-gray-600);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: var(--pl-transition);
}

.pl-back-button:hover {
  background: var(--pl-gray-100);
  color: var(--pl-gray-900);
}

.pl-back-button-large {
  display: block;
  width: fit-content;
  margin: 24px auto 0;
  padding: 12px 24px;
  background: var(--pl-gray-100);
  border: none;
  border-radius: 8px;
  color: var(--pl-gray-700);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--pl-transition);
}

.pl-back-button-large:hover {
  background: var(--pl-gray-200);
  color: var(--pl-gray-900);
}

/* Loading States */
.pl-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.pl-loading {
  text-align: center;
}

.pl-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--pl-gray-200);
  border-top-color: var(--pl-gold);
  border-radius: 50%;
  animation: pl-spin 1s linear infinite;
  margin: 0 auto 16px;
}

.pl-loading-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
}

.pl-spinner-small {
  width: 32px;
  height: 32px;
  border: 2px solid var(--pl-gray-200);
  border-top-color: var(--pl-gold);
  border-radius: 50%;
  animation: pl-spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes pl-spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.pl-error {
  text-align: center;
  padding: 48px 24px;
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius);
}

.pl-error-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.pl-error-icon svg {
  width: 100%;
  height: 100%;
  stroke: var(--pl-gold);
}

.pl-error p {
  color: var(--pl-gray-600);
  margin-bottom: 16px;
}

/* Checkout Section (Inline) */
.pl-checkout-section {
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius-lg);
  padding: 32px 24px;
  margin-top: 24px;
}

.pl-checkout-header {
  margin-bottom: 24px;
}

.pl-checkout-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--pl-gray-900);
  margin: 0;
}

.pl-checkout-summary {
  background: var(--pl-white);
  border-radius: var(--pl-radius);
  padding: 20px 24px;
  margin-bottom: 24px;
}

.pl-checkout-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.pl-checkout-label {
  font-size: 14px;
  color: var(--pl-gray-600);
}

.pl-checkout-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--pl-gray-900);
}

.pl-checkout-content {
  background: var(--pl-white);
  border-radius: var(--pl-radius);
  padding: 24px;
}

/* Confirmation Modal */
.pl-confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.pl-confirmation-modal {
  background: var(--pl-white);
  border-radius: var(--pl-radius-lg);
  padding: 48px 40px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: var(--pl-shadow-xl);
}

.pl-confirmation-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.1) 0%, rgba(201, 169, 98, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.pl-confirmation-icon svg {
  width: 48px;
  height: 48px;
  stroke: var(--pl-gold);
}

.pl-confirmation-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--pl-gray-900);
  margin: 0 0 12px 0;
}

.pl-confirmation-message {
  font-size: 16px;
  color: var(--pl-gray-600);
  margin: 0 0 24px 0;
}

.pl-confirmation-details {
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius);
  padding: 20px;
  margin-bottom: 24px;
}

.pl-confirmation-details h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--pl-gray-500);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pl-confirmation-details p {
  margin: 4px 0;
  color: var(--pl-gray-800);
}

.pl-confirmation-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.05) 0%, rgba(201, 169, 98, 0.1) 100%);
  border-radius: var(--pl-radius);
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.pl-info-icon {
  flex-shrink: 0;
}

.pl-info-icon svg {
  stroke: var(--pl-gold);
}

.pl-confirmation-info p {
  margin: 0;
  font-size: 14px;
  color: var(--pl-gray-700);
}

.pl-confirmation-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .pl-booking-container {
    padding: 16px;
  }

  .pl-hero {
    padding: 32px 20px;
  }

  .pl-hero-title {
    font-size: 28px;
  }

  .pl-service-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .pl-service-check {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  .pl-service-card.pl-selected .pl-service-check {
    opacity: 1;
  }

  .pl-times-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .pl-confirmation-modal {
    padding: 32px 24px;
  }

  .pl-confirmation-actions {
    flex-direction: column;
  }

  .pl-button {
    width: 100%;
  }
}

/* Hide the "Töm varukorgen" (Clear cart) button in checkout */
.pl-checkout-section .zoezi-checkout .d-flex.justify-end,
.pl-checkout-section .col-md-6 .d-flex.justify-end.mb-1.mr-2 {
  display: none !important;
}

/* Also hide using the text-decoration-underline class as fallback */
.pl-checkout-section .zoezi-checkout .text-decoration-underline {
  display: none !important;
}
```

---

## API Endpoints Used

### Fetch Services
```
GET /api/public/resourcebooking/service/get
```

### Fetch Available Slots (for calendar and time selection)
```
GET /api/public/resourcebooking/get
Parameters: service, start, end, staffs
```

### Create Reservation
```
POST /api/resource/reservation/add_resourcebooking
```

---

## Testing Checklist

- [ ] Service selection works correctly
- [ ] Calendar shows available dates (dates with available slots)
- [ ] Month navigation works
- [ ] Time slots load for selected date
- [ ] Checkout section shows inline (not modal)
- [ ] Booking completes successfully
- [ ] Confirmation modal displays
- [ ] Mobile responsive design
- [ ] Loading states display properly
- [ ] Error handling works

---

## Summary

This component provides a premium booking experience for Pelvic Lab's PelviX treatments with:
- Elegant white/gray/gold color scheme
- Step-by-step booking flow
- Interactive calendar showing dates with availability
- Inline Zoezi checkout (not a modal)
- Proper reservation flow before checkout
- Mobile-responsive design

---

*Last updated: 2026-01-22*
