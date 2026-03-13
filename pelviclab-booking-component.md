# Pelvic Lab PelviX Booking Component - COMPLETE (Copy-Paste Ready)

**Component Type:** User-Facing Booking Component
**Purpose:** Allow users to book PelviX treatments with smart service auto-selection
**Access Level:** Public (with login for checkout)
**Zoezi Domain:** pelviclab.zoezi.se

---

## Features

- Smart service routing: auto-selects service based on user booking history
- Logged-in users skip service selection entirely
- Non-logged-in users get a simple question to determine service
- Elegant white/gold design with slim calendar
- Interactive calendar with available dates
- Time slot selection
- Inline Zoezi checkout (not modal)
- Mobile responsive
- Confirmation modal

---

## Services Configuration

```javascript
// Available services from Zoezi (configured via props)
// introServiceName: "PelviX första gången" (for new customers)
// regularServiceName: "PelviX" (for returning customers)
// Service IDs are resolved dynamically from the API
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

  <!-- Intro Card Checkout (buy trial card before booking) -->
  <div v-if="showIntroCheckout && !loading" class="pl-checkout-section">
    <div class="pl-checkout-header">
      <h2>Kom igång med PelviX</h2>
    </div>

    <div class="pl-intro-info">
      <div class="pl-info-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <p>För att boka din första behandling behöver du ett provträningskort. Slutför köpet nedan så kan du boka din tid direkt. <strong>Observera: kortet måste användas inom en vecka.</strong></p>
    </div>

    <div class="pl-checkout-content">
      <zoezi-checkout
        ref="introCheckout"
        :items="introCheckoutItems"
        :dialog="false"
        :show-back-link="false"
        :new-style-done-dialog="false"
        @done="onIntroCheckoutComplete"
        @almostdone="onIntroCheckoutComplete"
        @close="resetIntroCheckout"
      />
    </div>
  </div>

  <!-- Main Booking Flow -->
  <div v-if="!loading && !error && !showCheckoutSection && !showIntroCheckout">

    <!-- Slim Header (replaces old hero) -->
    <div v-if="selectedService" class="pl-header">
      <div class="pl-header-label">Boka behandling</div>
      <h1 class="pl-header-title">{{ selectedService.name }}</h1>
      <div class="pl-header-divider"></div>
    </div>

    <!-- Question Step (non-logged-in users only) -->
    <div v-if="currentStep === 'question'" class="pl-step pl-step-question">
      <div class="pl-question-card">
        <div class="pl-question-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h2 class="pl-question-title">Välkommen till PelviX</h2>
        <p class="pl-question-text">Har du gjort behandling hos oss tidigare?</p>
        <div class="pl-question-buttons">
          <button @click="answerQuestion(true)" class="pl-button pl-button-primary">
            Ja
          </button>
          <button @click="answerQuestion(false)" class="pl-button pl-button-outline">
            Nej, det är min första gång
          </button>
        </div>
      </div>
    </div>

    <!-- Upsell Banner (logged-in users without active card) -->
    <a
      v-if="!hasActiveCard && selectedService && $store.state.user && (currentStep === 'calendar' || currentStep === 'time')"
      :href="webshopUrl"
      class="pl-upsell-banner"
    >
      <span class="pl-upsell-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      </span>
      <span class="pl-upsell-text">Spara med klippkort / medlemskap</span>
      <span class="pl-upsell-arrow">→</span>
    </a>

    <!-- Calendar Step -->
    <div v-if="currentStep === 'calendar'" class="pl-step pl-step-calendar">
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

    <!-- Time Selection Step -->
    <div v-if="currentStep === 'time'" class="pl-step pl-step-time">
      <!-- Date summary -->
      <div class="pl-selection-summary">
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

      <div class="pl-confirmation-info pl-confirmation-location">
        <div class="pl-info-icon">
          <span class="pl-location-emoji">📍</span>
        </div>
        <p>Move Wellness på Vadavägen 3, 186 70 Brottby</p>
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

      <div class="pl-confirmation-info">
        <div class="pl-info-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <p>5 minuter innan din bokning börjar kommer du kunna aktivera PelviX via "Aktivera". Observera att du måste fylla i en hälsodeklaration för att kunna aktivera PelviX. Det kan du redan nu göra via länken nedan.</p>
      </div>

      <div class="pl-confirmation-actions">
        <a href="/starta" class="pl-button pl-button-primary">Till aktiveringssidan</a>
        <a href="/minasidor" class="pl-button pl-button-secondary">Mina sidor</a>
        <button @click="closeConfirmation" class="pl-button pl-button-outline">Stäng</button>
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
    },
    introServiceName: {
      title: 'Intro service name (for new customers)',
      type: String,
      default: 'PelviX första gången'
    },
    regularServiceName: {
      title: 'Regular service name (for returning customers)',
      type: String,
      default: 'PelviX'
    },
    webshopUrl: {
      title: 'Webshop page URL (for upsell banner)',
      type: String,
      default: '/erbjudanden'
    },
    introProductId: {
      title: 'Product ID for intro/provträning clip card',
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      loading: true,
      loadingMessage: 'Laddar för succé',
      loadingCalendar: false,
      loadingTimes: false,
      error: null,

      // Steps: question -> calendar -> time
      currentStep: 'question',
      flowResolved: false,

      // Klippkort/membership upsell
      hasActiveCard: false,

      // Intro card flow
      hasIntroCard: false,
      showIntroCheckout: false,
      introCheckoutItems: [],
      introCheckoutPollInterval: null,

      // Services - loaded from API
      availableServices: [],
      selectedService: null,
      fullServiceData: [],

      // Calendar state
      currentMonth: new Date(),
      calendarDates: [],
      selectedDate: null,
      weekdays: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
      availabilityByDate: {},

      // Time slots
      availableTimes: [],
      selectedTime: null,

      // Checkout
      showCheckoutSection: false,
      checkoutItems: [],
      checkoutCompleted: false,
      checkoutLoading: false,
      checkoutPollInterval: null,

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
    },

    introService() {
      return this.availableServices.find(s => s.name === this.introServiceName) || this.availableServices[0];
    },

    regularService() {
      // Find exact match for regular service. Avoid matching the intro service
      // by ensuring we don't pick a service whose name contains "första"
      return this.availableServices.find(s =>
        s.name === this.regularServiceName
      ) || this.availableServices.find(s =>
        !s.name.toLowerCase().includes('första')
      ) || this.availableServices[0];
    }
  },

  watch: {
    '$store.state.user': {
      handler(user) {
        // Only resolve flow if not already resolved (prevents mid-flow resets)
        if (!this.flowResolved && this.availableServices.length > 0) {
          this.resolveEntryFlow();
        }
      }
    }
  },

  async mounted() {
    await this.fetchServices();
    this.resolveEntryFlow();
  },

  methods: {
    // Determine the entry flow based on auth state and booking history
    async resolveEntryFlow() {
      if (this.flowResolved || this._resolving) return;
      this._resolving = true;

      const user = this.$store.state.user;

      if (!user) {
        // Not logged in: show the question
        this.currentStep = 'question';
        this.loading = false;
        this._resolving = false;
        return;
      }

      // Logged in: check booking history
      this.loading = true;

      try {
        // Must pass startTime far back to get historical bookings
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        const startTime = this.formatDateISO(tenYearsAgo) + ' 00:00';

        const result = await window.$zoeziapi.get('/api/memberapi/bookings/get', {
          startTime: startTime
        });

        // Guard: if flow was resolved while we were waiting, abort
        if (this.flowResolved) {
          this.loading = false;
          this._resolving = false;
          return;
        }

        // Response format: { resourcebookings: [{ bookings: [...] }], ... }
        let hasHistory = false;
        if (result && Array.isArray(result.resourcebookings)) {
          hasHistory = result.resourcebookings.some(rb =>
            Array.isArray(rb.bookings) && rb.bookings.length > 0
          );
        }

        if (hasHistory) {
          // Returning customer → regular PelviX
          this.selectServiceAndShowCalendar(this.regularService);
        } else {
          // New customer → check if they need to buy intro card first
          await this.handleIntroFlow();
        }
      } catch (err) {
        console.error('Error checking booking history:', err);
        // Fallback: show the question
        this.currentStep = 'question';
        this.loading = false;
      } finally {
        this._resolving = false;
      }
    },

    // Select a service and transition to the calendar
    selectServiceAndShowCalendar(service) {
      if (!service) {
        console.error('No service available to select');
        this.error = 'Inga behandlingar tillgängliga just nu. Försök igen senare.';
        this.loading = false;
        return;
      }
      this.selectedService = service;
      this.flowResolved = true;
      this.currentStep = 'calendar';
      this.loading = false;
      this.checkActiveCard();
      this.loadCalendarAvailability();
    },

    // Check if user has an active PelviX klippkort or membership
    checkActiveCard() {
      const user = this.$store && this.$store.state && this.$store.state.user;
      if (!user) {
        this.hasActiveCard = false;
        return;
      }

      const userCards = user.cards || (this.$store.state.cards) || [];
      if (!Array.isArray(userCards) || userCards.length === 0) {
        this.hasActiveCard = false;
        return;
      }

      this.hasActiveCard = userCards.some(card => {
        const cardName = (card.cardtype_name || card.name || '').toLowerCase();
        if (!cardName.includes('pelvix') && !cardName.includes('pelvi')) return false;
        // Klippkort: must have trainings left
        if (card.trainingsLeft !== undefined && card.trainingsLeft !== null) {
          return card.trainingsLeft > 0;
        }
        // Membership: active if card exists (unlimited trainings)
        return true;
      });
    },

    // Handle intro flow: check if user has intro card, show checkout if not
    async handleIntroFlow() {
      // No intro product configured → go straight to calendar
      if (!this.introProductId) {
        this.selectServiceAndShowCalendar(this.introService);
        return;
      }

      // Check if user has ever had the intro card
      const user = this.$store.state.user;
      let hasActiveIntroCard = false;
      let hasEverHadIntroCard = false;

      if (user) {
        try {
          const cards = await this.$api.get('/api/memberapi/trainingcard/get/all');
          if (Array.isArray(cards)) {
            const introCards = cards.filter(card => card.product_id === this.introProductId);
            hasEverHadIntroCard = introCards.length > 0;
            hasActiveIntroCard = introCards.some(card => {
              if (!card.paid) return false;
              if (card.trainingsLeft !== null && card.trainingsLeft !== undefined && card.trainingsLeft <= 0) return false;
              return true;
            });
          }
        } catch (err) {
          console.error('Error checking intro cards:', err);
        }
      }

      if (hasEverHadIntroCard && !hasActiveIntroCard) {
        // Had intro card before but used it → regular PelviX
        this.selectServiceAndShowCalendar(this.regularService);
      } else if (hasActiveIntroCard) {
        // Has active intro card → intro calendar
        this.hasIntroCard = true;
        this.selectServiceAndShowCalendar(this.introService);
      } else {
        // Never had intro card → buy it first
        this.selectedService = this.introService;
        this.flowResolved = true;
        this.introCheckoutItems = [{
          product_id: this.introProductId,
          count: 1,
          users: user ? [user.id || user.userId] : [],
          site_id: 1
        }];
        this.showIntroCheckout = true;
        this.loading = false;

        this.$nextTick(() => {
          this.startIntroCheckoutPolling();
        });
      }
    },

    startIntroCheckoutPolling() {
      if (this.introCheckoutPollInterval) {
        clearInterval(this.introCheckoutPollInterval);
      }

      let checkCount = 0;

      this.introCheckoutPollInterval = setInterval(() => {
        checkCount++;

        if (!this.showIntroCheckout) {
          clearInterval(this.introCheckoutPollInterval);
          this.introCheckoutPollInterval = null;
          return;
        }

        if (this.$refs.introCheckout && this.$refs.introCheckout.done === true) {
          clearInterval(this.introCheckoutPollInterval);
          this.introCheckoutPollInterval = null;
          this.onIntroCheckoutComplete(this.$refs.introCheckout.orderconfirmation || {});
          return;
        }

        if (checkCount > 1000) {
          clearInterval(this.introCheckoutPollInterval);
          this.introCheckoutPollInterval = null;
        }
      }, 300);
    },

    onIntroCheckoutComplete(result) {
      if (!result) return;

      if (this.introCheckoutPollInterval) {
        clearInterval(this.introCheckoutPollInterval);
        this.introCheckoutPollInterval = null;
      }

      this.showIntroCheckout = false;
      this.hasIntroCard = true;

      // Now show the calendar to book their intro session
      this.currentStep = 'calendar';
      this.loading = false;
      this.checkActiveCard();
      this.loadCalendarAvailability();
    },

    resetIntroCheckout() {
      if (this.introCheckoutPollInterval) {
        clearInterval(this.introCheckoutPollInterval);
        this.introCheckoutPollInterval = null;
      }
      this.showIntroCheckout = false;
      this.introCheckoutItems = [];
      this.flowResolved = false;
      this.currentStep = 'question';
    },

    // Handle the Ja/Nej question for non-logged-in users
    async answerQuestion(hasHistory) {
      if (hasHistory) {
        this.selectServiceAndShowCalendar(this.regularService);
      } else {
        this.loading = true;
        await this.handleIntroFlow();
      }
    },

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
      this.loadingMessage = 'Laddar för succé';

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
      this.loadingMessage = 'Laddar för succé';

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

        // Scroll to checkout section and start polling
        this.$nextTick(() => {
          const checkoutElement = document.querySelector('.pl-checkout-section');
          if (checkoutElement) {
            checkoutElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          this.startCheckoutPolling();
        });

      } catch (error) {
        console.error('Reservation failed:', error);
        this.error = 'Tiden kunde inte reserveras. Den kan redan vara bokad.';
        this.loading = false;
      }
    },

    // Reset selection and hide checkout
    resetSelection() {
      if (this.checkoutPollInterval) {
        clearInterval(this.checkoutPollInterval);
        this.checkoutPollInterval = null;
      }
      this.showCheckoutSection = false;
      this.checkoutCompleted = false;
      this.selectedTime = null;

      // Scroll back to time selection
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    // Polling backup: zoezi-checkout @done event doesn't always fire
    startCheckoutPolling() {
      if (this.checkoutPollInterval) {
        clearInterval(this.checkoutPollInterval);
      }

      let checkCount = 0;

      this.checkoutPollInterval = setInterval(() => {
        checkCount++;

        if (!this.showCheckoutSection) {
          clearInterval(this.checkoutPollInterval);
          this.checkoutPollInterval = null;
          return;
        }

        if (this.$refs.checkout && this.$refs.checkout.done === true) {
          clearInterval(this.checkoutPollInterval);
          this.checkoutPollInterval = null;

          const orderData = this.$refs.checkout.orderconfirmation;
          this.handleCheckoutSuccess({
            status: 'done',
            paid: true,
            orderconfirmation: orderData || []
          });
          return;
        }

        if (checkCount > 1000) {
          clearInterval(this.checkoutPollInterval);
          this.checkoutPollInterval = null;
        }
      }, 300);
    },

    handleCheckoutSuccess(eventData) {
      if (!eventData) return;

      if (this.checkoutPollInterval) {
        clearInterval(this.checkoutPollInterval);
        this.checkoutPollInterval = null;
      }

      let orderData = eventData;
      if (eventData.detail) orderData = eventData.detail;
      else if (eventData.data) orderData = eventData.data;

      this.orderDetails = orderData;
      this.showCheckoutSection = false;
      this.checkoutCompleted = true;
      this.showConfirmation = true;
    },

    onCheckoutComplete(result) {
      console.log('Checkout complete:', result);
      if (!result) return;
      this.handleCheckoutSuccess(result);
    },

    closeConfirmation() {
      this.showConfirmation = false;
      this.resetBooking();
    },

    resetBooking() {
      this.selectedDate = null;
      this.selectedTime = null;
      this.availableTimes = [];
      this.checkoutItems = [];
      this.orderDetails = null;
      this.showCheckoutSection = false;
      this.checkoutCompleted = false;

      // Go back to calendar (service stays selected)
      this.currentStep = 'calendar';
      this.loadCalendarAvailability();

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
   Elegant Design: White, Gold, Refined
   ======================================== */

/* CSS Variables */
.pl-booking-container {
  --pl-gold: #C9A962;
  --pl-gold-light: #E8D5A8;
  --pl-gold-dark: #9A7B3A;
  --pl-gold-glow: rgba(201, 169, 98, 0.12);
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
  --pl-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --pl-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --pl-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
  --pl-shadow-xl: 0 8px 30px rgba(0, 0, 0, 0.12);
  --pl-radius: 12px;
  --pl-radius-lg: 16px;
  --pl-transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Container */
.pl-booking-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 540px;
  margin: 0 auto;
  padding: 20px;
  background: var(--pl-white);
  color: var(--pl-text);
  line-height: 1.6;
}

/* Slim Header (replaces old hero) */
.pl-header {
  text-align: center;
  padding: 20px 0 16px;
  margin-bottom: 8px;
}

.pl-header-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--pl-gold);
  margin-bottom: 6px;
}

.pl-header-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--pl-gray-900);
  margin: 0;
  letter-spacing: -0.3px;
}

.pl-header-divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--pl-gold-light), var(--pl-gold), var(--pl-gold-light));
  margin: 14px auto 0;
  border-radius: 1px;
}

/* Question Step */
.pl-step-question {
  padding: 16px 0;
}

.pl-question-card {
  text-align: center;
  padding: 40px 24px;
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius-lg);
  border: 1px solid var(--pl-gray-200);
}

.pl-question-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  background: var(--pl-gold-glow);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pl-question-icon svg {
  width: 28px;
  height: 28px;
  stroke: var(--pl-gold);
}

.pl-question-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--pl-gray-900);
  margin: 0 0 8px 0;
}

.pl-question-text {
  font-size: 15px;
  color: var(--pl-gray-600);
  margin: 0 0 28px 0;
}

.pl-question-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
  margin: 0 auto;
}

/* Step Header */
.pl-step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pl-step-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--pl-gray-900);
  margin: 0;
}

/* Selection Summary */
.pl-selection-summary {
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius);
  padding: 12px;
  margin-bottom: 16px;
}

.pl-summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--pl-transition);
}

.pl-summary-item:hover {
  background: var(--pl-gray-100);
}

.pl-summary-icon {
  width: 36px;
  height: 36px;
  background: var(--pl-white);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--pl-shadow-sm);
}

.pl-summary-icon svg {
  width: 18px;
  height: 18px;
  stroke: var(--pl-gold);
}

.pl-summary-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pl-summary-label {
  font-size: 11px;
  color: var(--pl-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pl-summary-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--pl-gray-900);
}

.pl-summary-edit {
  font-size: 12px;
  color: var(--pl-gold);
  font-weight: 500;
}

/* Calendar */
.pl-calendar-wrapper {
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius-lg);
  padding: 16px;
}

.pl-calendar {
  background: var(--pl-white);
  border-radius: var(--pl-radius);
  padding: 16px;
  box-shadow: var(--pl-shadow-sm);
}

.pl-calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--pl-gray-100);
}

.pl-month-nav {
  width: 34px;
  height: 34px;
  background: var(--pl-white);
  border: 1px solid var(--pl-gray-200);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--pl-transition);
}

.pl-month-nav:hover:not(:disabled) {
  background: var(--pl-gray-50);
  border-color: var(--pl-gold);
}

.pl-month-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pl-month-nav svg {
  width: 16px;
  height: 16px;
  stroke: var(--pl-gray-700);
}

.pl-month-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--pl-gray-900);
  margin: 0;
}

.pl-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.pl-weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--pl-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 0;
}

.pl-calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--pl-transition);
  position: relative;
}

.pl-calendar-day.pl-empty {
  cursor: default;
}

.pl-calendar-day.pl-disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.pl-calendar-day.pl-available:hover {
  background: var(--pl-gold-glow);
}

.pl-calendar-day.pl-selected {
  background: linear-gradient(135deg, var(--pl-gold) 0%, var(--pl-gold-dark) 100%);
}

.pl-calendar-day.pl-today .pl-day-number {
  font-weight: 700;
  color: var(--pl-gold);
}

.pl-day-number {
  font-size: 13px;
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
  width: 3px;
  height: 3px;
  background: var(--pl-gold);
  border-radius: 50%;
  margin-top: 1px;
}

.pl-calendar-day.pl-selected .pl-day-dot {
  background: var(--pl-white);
}

/* Calendar Legend */
.pl-calendar-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
  padding-top: 12px;
}

.pl-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--pl-gray-600);
}

.pl-legend-dot {
  width: 8px;
  height: 8px;
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
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
}

.pl-time-slot {
  background: var(--pl-white);
  border: 1.5px solid var(--pl-gray-200);
  border-radius: 8px;
  padding: 12px 8px;
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
  background: var(--pl-gold-glow);
}

.pl-time-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--pl-gray-900);
}

.pl-time-slot.pl-selected .pl-time-value {
  color: var(--pl-gold-dark);
}

/* No Times */
.pl-no-times {
  text-align: center;
  padding: 36px 20px;
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius);
}

.pl-no-times-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
}

.pl-no-times-icon svg {
  width: 100%;
  height: 100%;
  stroke: var(--pl-gray-400);
}

.pl-no-times p {
  color: var(--pl-gray-600);
  margin-bottom: 12px;
  font-size: 14px;
}

/* Continue Section */
.pl-continue-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--pl-gray-100);
  text-align: center;
}

/* Buttons */
.pl-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--pl-transition);
  border: none;
  text-decoration: none;
}

.pl-button-primary,
a.pl-button-primary,
a.pl-button-primary:visited,
a.pl-button-primary:hover,
a.pl-button-primary:active {
  background: linear-gradient(135deg, var(--pl-gold) 0%, var(--pl-gold-dark) 100%);
  color: var(--pl-white) !important;
  box-shadow: var(--pl-shadow);
  text-decoration: none;
}

.pl-button-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--pl-shadow-lg);
}

.pl-button-secondary,
a.pl-button-secondary,
a.pl-button-secondary:visited,
a.pl-button-secondary:active {
  background: var(--pl-white);
  color: var(--pl-gray-700) !important;
  border: 1.5px solid var(--pl-gray-200);
  text-decoration: none;
}

.pl-button-secondary:hover {
  border-color: var(--pl-gold);
  color: var(--pl-gold-dark);
}

.pl-button-outline {
  background: var(--pl-white);
  color: var(--pl-gray-700);
  border: 1.5px solid var(--pl-gray-200);
}

.pl-button-outline:hover {
  border-color: var(--pl-gold-light);
  color: var(--pl-gray-900);
  background: var(--pl-gray-50);
}

.pl-button-large {
  padding: 14px 32px;
  font-size: 15px;
}

/* Back Button */
.pl-back-button-large {
  display: block;
  width: fit-content;
  margin: 20px auto 0;
  padding: 10px 20px;
  background: var(--pl-gray-50);
  border: 1px solid var(--pl-gray-200);
  border-radius: 8px;
  color: var(--pl-gray-600);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--pl-transition);
}

.pl-back-button-large:hover {
  background: var(--pl-gray-100);
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
  width: 40px;
  height: 40px;
  border: 2px solid var(--pl-gray-200);
  border-top-color: var(--pl-gold);
  border-radius: 50%;
  animation: pl-spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

.pl-loading p {
  font-size: 14px;
  color: var(--pl-gray-600);
}

.pl-loading-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 20px;
}

.pl-spinner-small {
  width: 28px;
  height: 28px;
  border: 2px solid var(--pl-gray-200);
  border-top-color: var(--pl-gold);
  border-radius: 50%;
  animation: pl-spin 0.8s linear infinite;
  margin-bottom: 10px;
}

.pl-loading-inline p {
  font-size: 14px;
  color: var(--pl-gray-600);
}

@keyframes pl-spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.pl-error {
  text-align: center;
  padding: 36px 20px;
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius);
}

.pl-error-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
}

.pl-error-icon svg {
  width: 100%;
  height: 100%;
  stroke: var(--pl-gold);
}

.pl-error p {
  color: var(--pl-gray-600);
  margin-bottom: 12px;
  font-size: 14px;
}

/* Upsell Banner */
.pl-upsell-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(201, 169, 98, 0.14) 100%);
  border: 1px solid var(--pl-gold-light);
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  transition: var(--pl-transition);
}

.pl-upsell-banner:hover {
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.12) 0%, rgba(201, 169, 98, 0.2) 100%);
  border-color: var(--pl-gold);
}

.pl-upsell-icon {
  flex-shrink: 0;
  color: var(--pl-gold-dark);
}

.pl-upsell-icon svg {
  stroke: var(--pl-gold-dark);
}

.pl-upsell-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--pl-gold-dark);
}

.pl-upsell-arrow {
  font-size: 14px;
  color: var(--pl-gold);
}

/* Checkout Section (Inline) */
.pl-checkout-section {
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius-lg);
  padding: 16px 12px;
  margin-top: 16px;
}

.pl-checkout-header {
  margin-bottom: 10px;
}

.pl-checkout-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--pl-gray-900);
  margin: 0;
}

.pl-checkout-summary {
  background: var(--pl-white);
  border-radius: var(--pl-radius);
  padding: 10px 14px;
  margin-bottom: 10px;
}

.pl-checkout-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
}

.pl-checkout-label {
  font-size: 12px;
  color: var(--pl-gray-600);
}

.pl-checkout-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--pl-gray-900);
}

.pl-checkout-content {
  background: var(--pl-white);
  border-radius: var(--pl-radius);
  padding: 8px;
}

/* === Zoezi Checkout Internal Overrides === */
/* Scale down all internal text, inputs, buttons to fit slim container */

.pl-checkout-content .zoezi-checkout {
  font-size: 13px !important;
}

/* Reduce Vuetify card padding */
.pl-checkout-content .v-card {
  padding: 8px !important;
  box-shadow: none !important;
}

.pl-checkout-content .v-card__text {
  padding: 8px !important;
  font-size: 13px !important;
}

.pl-checkout-content .v-card__title {
  font-size: 15px !important;
  padding: 8px !important;
}

.pl-checkout-content .v-card__actions {
  padding: 8px !important;
}

/* Compact input fields */
.pl-checkout-content .v-input {
  font-size: 13px !important;
}

.pl-checkout-content .v-input__slot {
  min-height: 36px !important;
}

.pl-checkout-content .v-text-field input {
  font-size: 13px !important;
  padding: 4px 0 !important;
}

.pl-checkout-content .v-label {
  font-size: 13px !important;
}

.pl-checkout-content .v-select__selection {
  font-size: 13px !important;
}

.pl-checkout-content .v-messages {
  font-size: 11px !important;
  min-height: 16px !important;
}

/* Compact buttons */
.pl-checkout-content .v-btn {
  font-size: 13px !important;
  height: 38px !important;
  min-width: auto !important;
  padding: 0 16px !important;
}

.pl-checkout-content .v-btn--large,
.pl-checkout-content .v-btn--x-large {
  height: 40px !important;
  font-size: 14px !important;
}

/* Compact stepper if present */
.pl-checkout-content .v-stepper__header {
  height: auto !important;
  box-shadow: none !important;
}

.pl-checkout-content .v-stepper__step {
  padding: 8px 12px !important;
}

.pl-checkout-content .v-stepper__label {
  font-size: 12px !important;
}

.pl-checkout-content .v-stepper__content {
  padding: 8px 12px !important;
}

/* Fix grid columns to stack on slim container */
.pl-checkout-content .col-md-6,
.pl-checkout-content .col-md-4,
.pl-checkout-content .col-md-8 {
  flex: 0 0 100% !important;
  max-width: 100% !important;
}

.pl-checkout-content .col-12,
.pl-checkout-content .col {
  padding: 4px 8px !important;
}

.pl-checkout-content .row {
  margin: 0 -8px !important;
}

/* Reduce spacing in checkout content */
.pl-checkout-content .pa-4,
.pl-checkout-content .pa-3 {
  padding: 8px !important;
}

.pl-checkout-content .mb-4,
.pl-checkout-content .mb-3 {
  margin-bottom: 8px !important;
}

.pl-checkout-content .mt-4,
.pl-checkout-content .mt-3 {
  margin-top: 8px !important;
}

/* Reduce heading sizes inside checkout */
.pl-checkout-content h1,
.pl-checkout-content h2,
.pl-checkout-content h3 {
  font-size: 15px !important;
  margin-bottom: 6px !important;
}

.pl-checkout-content h4,
.pl-checkout-content h5,
.pl-checkout-content h6 {
  font-size: 13px !important;
  margin-bottom: 4px !important;
}

/* Compact list items */
.pl-checkout-content .v-list-item {
  min-height: 36px !important;
  padding: 0 8px !important;
}

.pl-checkout-content .v-list-item__content {
  padding: 6px 0 !important;
}

.pl-checkout-content .v-list-item__title {
  font-size: 13px !important;
}

.pl-checkout-content .v-list-item__subtitle {
  font-size: 12px !important;
}

/* Compact dividers and spacing */
.pl-checkout-content .v-divider {
  margin: 6px 0 !important;
}

/* Compact expansion panels */
.pl-checkout-content .v-expansion-panel-header {
  padding: 8px 12px !important;
  font-size: 13px !important;
  min-height: 36px !important;
}

.pl-checkout-content .v-expansion-panel-content__wrap {
  padding: 8px 12px !important;
}

/* Force text wrapping */
.pl-checkout-content * {
  word-break: break-word;
}

/* Override any max-width that might cause overflow */
.pl-checkout-content .zoezi-checkout,
.pl-checkout-content .zoezi-checkout > * {
  max-width: 100% !important;
  overflow: hidden;
}

/* Confirmation Modal */
.pl-confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.pl-confirmation-modal {
  background: var(--pl-white);
  border-radius: var(--pl-radius-lg);
  padding: 40px 32px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: var(--pl-shadow-xl);
}

.pl-confirmation-icon {
  width: 64px;
  height: 64px;
  background: var(--pl-gold-glow);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.pl-confirmation-icon svg {
  width: 36px;
  height: 36px;
  stroke: var(--pl-gold);
}

.pl-confirmation-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--pl-gray-900);
  margin: 0 0 8px 0;
}

.pl-confirmation-message {
  font-size: 14px;
  color: var(--pl-gray-600);
  margin: 0 0 20px 0;
}

.pl-confirmation-details {
  background: var(--pl-gray-50);
  border-radius: var(--pl-radius);
  padding: 16px;
  margin-bottom: 20px;
}

.pl-confirmation-details h3 {
  font-size: 12px;
  font-weight: 600;
  color: var(--pl-gray-500);
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pl-confirmation-details p {
  margin: 3px 0;
  color: var(--pl-gray-800);
  font-size: 14px;
}

.pl-confirmation-info,
.pl-intro-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--pl-gold-glow);
  border-radius: var(--pl-radius);
  padding: 14px;
  margin-bottom: 20px;
  text-align: left;
}

.pl-info-icon {
  flex-shrink: 0;
}

.pl-info-icon svg {
  stroke: var(--pl-gold);
}

.pl-confirmation-info p,
.pl-intro-info p {
  margin: 0;
  font-size: 13px;
  color: var(--pl-gray-700);
}

.pl-confirmation-location {
  background: var(--pl-gray-50, #FAFAFA);
  border: 1px solid var(--pl-gray-200, #EEEEEE);
}

.pl-confirmation-location p {
  font-weight: 600;
  color: var(--pl-gray-800) !important;
}

.pl-location-emoji {
  font-size: 20px;
  line-height: 1;
}

.pl-confirmation-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .pl-booking-container {
    padding: 12px;
  }

  .pl-header-title {
    font-size: 22px;
  }

  .pl-question-card {
    padding: 28px 16px;
  }

  .pl-question-title {
    font-size: 20px;
  }

  .pl-times-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .pl-confirmation-modal {
    padding: 28px 20px;
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

### Check Booking History (logged-in users)
```
GET /api/memberapi/bookings/get
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

## Flow Logic

### Logged-in user with booking history
Services fetch → booking history check → auto-select "PelviX" → calendar

### Logged-in user without booking history
Services fetch → booking history check (empty) → auto-select "PelviX första gången" → calendar

### Not logged in
Services fetch → show question "Har du gjort behandling hos oss tidigare?" → Ja/Nej → auto-select service → calendar

### Error fallback
If booking history API fails → show question (same as not logged in)

---

## Testing Checklist

- [ ] Logged-in user with past bookings → auto-selects PelviX, shows calendar
- [ ] Logged-in user without bookings → auto-selects PelviX första gången, shows calendar
- [ ] Not logged in → shows question with Ja/Nej
- [ ] Ja answer → selects PelviX, shows calendar
- [ ] Nej answer → selects PelviX första gången, shows calendar
- [ ] Header shows correct service name
- [ ] Calendar shows available dates
- [ ] Month navigation works
- [ ] Time slots load for selected date
- [ ] Checkout section shows inline (not modal)
- [ ] Booking completes successfully
- [ ] Confirmation modal displays
- [ ] Mobile responsive design
- [ ] Loading states display properly
- [ ] Error handling works (API failure falls back to question)

---

## Props Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| daysAhead | Number | 90 | Days ahead to show in calendar |
| introServiceName | String | "PelviX första gången" | Name of intro service (matched from API) |
| regularServiceName | String | "PelviX" | Name of regular service (matched from API) |

---
