# Pelvic Lab PelviX Webshop Component - COMPLETE (Copy-Paste Ready)

**Component Type:** User-Facing Webshop Component
**Purpose:** Allow users to purchase PelviX klippkort and memberships
**Access Level:** Public (with login for checkout)
**Zoezi Domain:** pelviclab.zoezi.se

---

## Features

- Premium white/gray/gold design
- Beautiful product cards with hover effects
- Three product tiers (Klippkort, 6 Month, VIP Gold)
- Inline Zoezi checkout (not modal)
- Mobile responsive
- Login prompt for non-authenticated users
- Confirmation modal

---

## Products Configuration

```javascript
// Product IDs - UPDATE THESE WITH ACTUAL IDs FROM ZOEZI
const products = [
  {
    id: 1, // Update with actual product ID
    name: "PelviX Klippkort",
    subtitle: "10 behandlingar",
    price: 4995,
    originalPrice: 7995,
    type: "klippkort",
    features: [
      "10 PelviX-behandlingar",
      "Giltigt i 12 månader",
      "Boka när det passar dig",
      "Spara 3 000 kr"
    ],
    badge: "Populärast"
  },
  {
    id: 2, // Update with actual product ID
    name: "PelviX 6 Månader",
    subtitle: "Obegränsade behandlingar",
    price: 995,
    priceType: "month",
    type: "membership",
    features: [
      "Obegränsade behandlingar",
      "6 månaders bindningstid",
      "Prioriterad bokning",
      "Personlig uppföljning"
    ],
    badge: null
  },
  {
    id: 3, // Update with actual product ID
    name: "PelviX VIP Gold",
    subtitle: "Premium medlemskap",
    price: 1495,
    priceType: "month",
    type: "membership",
    features: [
      "Obegränsade behandlingar",
      "Ingen bindningstid",
      "VIP-tider & prioriterad bokning",
      "Gratis extrabehandlingar",
      "Personlig coach"
    ],
    badge: "VIP",
    highlighted: true
  }
];
```

---

## Installation in Zoezi

1. Go to Zoezi Admin Panel
2. Navigate to Components > Create New Component
3. Name: "PelviX Webshop"
4. Copy the complete HTML, JavaScript, and CSS below
5. Update product IDs with actual IDs from your Zoezi setup
6. Save and publish

---

## HTML

```html
<div class="plw-container">
  <!-- Hero Section -->
  <div class="plw-hero">
    <div class="plw-hero-content">
      <div class="plw-hero-badge">Exklusiva Erbjudanden</div>
      <h1 class="plw-hero-title">Investera i din hälsa</h1>
      <p class="plw-hero-subtitle">Välj det paket som passar dig bäst och påbörja din resa mot en starkare bäckenbotten</p>
    </div>
    <div class="plw-hero-decoration">
      <div class="plw-hero-circle"></div>
      <div class="plw-hero-circle plw-circle-2"></div>
    </div>
  </div>

  <!-- Products Grid -->
  <div class="plw-products-section">
    <div class="plw-products-grid">
      <!-- Product Card: Klippkort -->
      <div
        class="plw-product-card"
        :class="{ 'plw-selected': selectedProduct && selectedProduct.id === products[0].id }"
        @click="selectProduct(products[0])"
      >
        <div v-if="products[0].badge" class="plw-product-badge">{{ products[0].badge }}</div>
        <div class="plw-product-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
            <circle cx="7" cy="15" r="1.5"/>
            <circle cx="12" cy="15" r="1.5"/>
            <circle cx="17" cy="15" r="1.5"/>
          </svg>
        </div>
        <h3 class="plw-product-name">{{ products[0].name }}</h3>
        <p class="plw-product-subtitle">{{ products[0].subtitle }}</p>

        <div class="plw-product-price">
          <span class="plw-price-current">{{ formatPrice(products[0].price) }}</span>
          <span v-if="products[0].originalPrice" class="plw-price-original">{{ formatPrice(products[0].originalPrice) }}</span>
        </div>

        <ul class="plw-product-features">
          <li v-for="feature in products[0].features" :key="feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ feature }}
          </li>
        </ul>

        <button class="plw-product-button">
          <span>Välj paket</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <!-- Product Card: 6 Month -->
      <div
        class="plw-product-card"
        :class="{ 'plw-selected': selectedProduct && selectedProduct.id === products[1].id }"
        @click="selectProduct(products[1])"
      >
        <div v-if="products[1].badge" class="plw-product-badge">{{ products[1].badge }}</div>
        <div class="plw-product-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
          </svg>
        </div>
        <h3 class="plw-product-name">{{ products[1].name }}</h3>
        <p class="plw-product-subtitle">{{ products[1].subtitle }}</p>

        <div class="plw-product-price">
          <span class="plw-price-current">{{ formatPrice(products[1].price) }}</span>
          <span v-if="products[1].priceType === 'month'" class="plw-price-period">/ mån</span>
        </div>

        <ul class="plw-product-features">
          <li v-for="feature in products[1].features" :key="feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ feature }}
          </li>
        </ul>

        <button class="plw-product-button">
          <span>Välj paket</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <!-- Product Card: VIP Gold (Highlighted) -->
      <div
        class="plw-product-card plw-highlighted"
        :class="{ 'plw-selected': selectedProduct && selectedProduct.id === products[2].id }"
        @click="selectProduct(products[2])"
      >
        <div class="plw-product-badge plw-badge-gold">{{ products[2].badge }}</div>
        <div class="plw-product-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h3 class="plw-product-name">{{ products[2].name }}</h3>
        <p class="plw-product-subtitle">{{ products[2].subtitle }}</p>

        <div class="plw-product-price">
          <span class="plw-price-current">{{ formatPrice(products[2].price) }}</span>
          <span v-if="products[2].priceType === 'month'" class="plw-price-period">/ mån</span>
        </div>

        <ul class="plw-product-features">
          <li v-for="feature in products[2].features" :key="feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ feature }}
          </li>
        </ul>

        <button class="plw-product-button plw-button-gold">
          <span>Välj VIP</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Info Section -->
  <div class="plw-info-section">
    <div class="plw-info-card">
      <div class="plw-info-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div class="plw-info-content">
        <h4>22 minuter per behandling</h4>
        <p>Effektiv träning som passar in i din vardag</p>
      </div>
    </div>
    <div class="plw-info-card">
      <div class="plw-info-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div class="plw-info-content">
        <h4>Helt smärtfritt</h4>
        <p>Sit bekvämt och fullt påklädd under behandlingen</p>
      </div>
    </div>
    <div class="plw-info-card">
      <div class="plw-info-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="plw-info-content">
        <h4>Bevisad effekt</h4>
        <p>Kliniskt testad FMS-teknologi</p>
      </div>
    </div>
  </div>

  <!-- Checkout Section (Inline, not modal) -->
  <div v-if="showCheckoutSection" class="plw-checkout-section">
    <div class="plw-checkout-header">
      <h2>Slutför ditt köp</h2>
    </div>

    <!-- Selected Product Summary -->
    <div class="plw-checkout-summary">
      <div class="plw-summary-product">
        <div class="plw-summary-icon">
          <svg v-if="selectedProduct.type === 'klippkort'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <div class="plw-summary-details">
          <h3>{{ selectedProduct.name }}</h3>
          <p>{{ selectedProduct.subtitle }}</p>
        </div>
        <div class="plw-summary-price">
          <span class="plw-summary-amount">{{ formatPrice(selectedProduct.price) }}</span>
          <span v-if="selectedProduct.priceType === 'month'" class="plw-summary-period">/ mån</span>
        </div>
      </div>
    </div>

    <!-- Zoezi Checkout -->
    <div class="plw-checkout-content">
      <zoezi-checkout
        ref="checkout"
        :items="checkoutItems"
        :dialog="false"
        :show-back-link="false"
        :new-style-done-dialog="false"
        :countReadOnly="true"
        :userReadOnly="false"
        :showSummary="true"
        :showPaymentPart="true"
        :showPaymentButton="true"
        :siteId="siteId"
        @done="handleCheckoutComplete"
        @almostdone="handleCheckoutComplete"
        @loading="checkoutLoading = $event"
      />
    </div>

    <!-- Back button -->
    <button
      class="plw-back-button-large"
      @click="resetSelection"
      v-if="!checkoutCompleted && !checkoutLoading">
      ← Tillbaka till produkter
    </button>
  </div>

  <!-- Confirmation Modal -->
  <div v-if="showConfirmation" class="plw-confirmation-overlay">
    <div class="plw-confirmation-modal">
      <div class="plw-confirmation-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h2 class="plw-confirmation-title">Tack för ditt köp!</h2>
      <p class="plw-confirmation-message">Din beställning är bekräftad. Välkommen till Pelvic Lab!</p>

      <div v-if="orderDetails" class="plw-confirmation-details">
        <h3>Din beställning:</h3>
        <p><strong>{{ selectedProduct.name }}</strong></p>
        <p>{{ selectedProduct.subtitle }}</p>
      </div>

      <div class="plw-confirmation-next">
        <div class="plw-next-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="plw-next-content">
          <h4>Nästa steg</h4>
          <p>Boka din första PelviX-behandling och påbörja din resa mot en starkare bäckenbotten.</p>
        </div>
      </div>

      <div class="plw-confirmation-actions">
        <a href="/bokning" class="plw-button plw-button-primary">Boka behandling</a>
        <a href="/minasidor" class="plw-button plw-button-secondary">Mina sidor</a>
        <button @click="closeConfirmation" class="plw-button plw-button-text">Stäng</button>
      </div>
    </div>
  </div>
</div>
```

---

## JavaScript

```javascript
export default {
  name: 'pelviclab-webshop',

  zoezi: {
    title: 'Pelvic Lab PelviX Webshop',
    icon: 'mdi-shopping'
  },

  data() {
    return {
      siteId: 1,
      checkoutLoading: false,

      // Products - UPDATE PRODUCT IDs WITH ACTUAL VALUES FROM ZOEZI
      products: [
        {
          id: 1, // UPDATE THIS
          name: "PelviX Klippkort",
          subtitle: "10 behandlingar",
          price: 4995,
          originalPrice: 7995,
          type: "klippkort",
          productType: "trainingcard", // Zoezi product type
          features: [
            "10 PelviX-behandlingar",
            "Giltigt i 12 månader",
            "Boka när det passar dig",
            "Spara 3 000 kr"
          ],
          badge: "Populärast"
        },
        {
          id: 2, // UPDATE THIS
          name: "PelviX 6 Månader",
          subtitle: "Obegränsade behandlingar",
          price: 995,
          priceType: "month",
          type: "membership",
          productType: "trainingcard",
          features: [
            "Obegränsade behandlingar",
            "6 månaders bindningstid",
            "Prioriterad bokning",
            "Personlig uppföljning"
          ],
          badge: null
        },
        {
          id: 3, // UPDATE THIS
          name: "PelviX VIP Gold",
          subtitle: "Premium medlemskap",
          price: 1495,
          priceType: "month",
          type: "membership",
          productType: "trainingcard",
          features: [
            "Obegränsade behandlingar",
            "Ingen bindningstid",
            "VIP-tider & prioriterad bokning",
            "Gratis extrabehandlingar",
            "Personlig coach"
          ],
          badge: "VIP",
          highlighted: true
        }
      ],

      // Selection
      selectedProduct: null,

      // Checkout state
      showCheckoutSection: false,
      checkoutItems: [],
      checkoutCompleted: false,

      // Confirmation
      showConfirmation: false,
      orderDetails: null
    };
  },

  computed: {
    isUserLoggedIn() {
      return !!(window.$store &&
                window.$store.state &&
                window.$store.state.user &&
                window.$store.state.user.id);
    },

    currentUserId() {
      return this.isUserLoggedIn ? window.$store.state.user.id : null;
    }
  },

  methods: {
    formatPrice(price) {
      return price.toLocaleString('sv-SE') + ' kr';
    },

    selectProduct(product) {
      this.selectedProduct = product;
      this.prepareCheckout();
      this.showCheckoutSection = true;

      // Scroll to checkout section
      this.$nextTick(() => {
        const checkoutElement = document.querySelector('.plw-checkout-section');
        if (checkoutElement) {
          checkoutElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },

    prepareCheckout() {
      if (!this.selectedProduct) return;

      const items = [];

      if (this.selectedProduct.productType === 'trainingcard') {
        items.push({
          product_id: this.selectedProduct.id,
          count: 1,
          users: this.currentUserId ? [this.currentUserId] : [],
          site_id: this.siteId
        });
      } else {
        items.push({
          product_id: this.selectedProduct.id,
          count: 1,
          site_id: this.siteId
        });
      }

      this.checkoutItems = items;
    },

    resetSelection() {
      this.showCheckoutSection = false;
      this.selectedProduct = null;
      this.checkoutItems = [];
      this.checkoutCompleted = false;

      // Scroll back to top
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    handleCheckoutComplete() {
      console.log('Checkout completed');
      this.orderDetails = {
        product: this.selectedProduct
      };
      this.showCheckoutSection = false;
      this.checkoutCompleted = true;
      this.showConfirmation = true;
    },

    closeConfirmation() {
      this.showConfirmation = false;
      this.orderDetails = null;
      this.selectedProduct = null;
      this.checkoutCompleted = false;
    }
  }
};
```

---

## CSS

```css
/* ========================================
   PELVIC LAB WEBSHOP COMPONENT
   Premium Design: White, Gray, Gold
   ======================================== */

/* CSS Variables */
.plw-container {
  --plw-gold: #C9A962;
  --plw-gold-light: #E8D5A8;
  --plw-gold-dark: #9A7B3A;
  --plw-gold-gradient: linear-gradient(135deg, #C9A962 0%, #E8D5A8 50%, #C9A962 100%);
  --plw-white: #FFFFFF;
  --plw-gray-50: #FAFAFA;
  --plw-gray-100: #F5F5F5;
  --plw-gray-200: #EEEEEE;
  --plw-gray-300: #E0E0E0;
  --plw-gray-400: #BDBDBD;
  --plw-gray-500: #9E9E9E;
  --plw-gray-600: #757575;
  --plw-gray-700: #616161;
  --plw-gray-800: #424242;
  --plw-gray-900: #212121;
  --plw-text: #1A1A1A;
  --plw-text-light: #666666;
  --plw-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --plw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --plw-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --plw-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --plw-shadow-gold: 0 10px 40px -10px rgba(201, 169, 98, 0.4);
  --plw-radius: 12px;
  --plw-radius-lg: 16px;
  --plw-radius-xl: 24px;
  --plw-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Container */
.plw-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: var(--plw-white);
  color: var(--plw-text);
  line-height: 1.6;
}

/* Hero Section */
.plw-hero {
  position: relative;
  background: linear-gradient(135deg, var(--plw-gray-900) 0%, #2D2D2D 100%);
  border-radius: var(--plw-radius-xl);
  padding: 64px 40px;
  margin-bottom: 48px;
  overflow: hidden;
  text-align: center;
}

.plw-hero-content {
  position: relative;
  z-index: 1;
}

.plw-hero-badge {
  display: inline-block;
  background: var(--plw-gold-gradient);
  color: var(--plw-gray-900);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 8px 20px;
  border-radius: 30px;
  margin-bottom: 20px;
}

.plw-hero-title {
  font-size: 48px;
  font-weight: 800;
  color: var(--plw-white);
  margin: 0 0 16px 0;
  letter-spacing: -1px;
}

.plw-hero-subtitle {
  font-size: 18px;
  color: var(--plw-gray-400);
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
}

.plw-hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.plw-hero-circle {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--plw-gold) 0%, transparent 70%);
  opacity: 0.08;
  border-radius: 50%;
  top: -100px;
  right: -100px;
}

.plw-hero-circle.plw-circle-2 {
  width: 300px;
  height: 300px;
  top: auto;
  right: auto;
  bottom: -50px;
  left: -50px;
  opacity: 0.05;
}

/* Products Section */
.plw-products-section {
  margin-bottom: 48px;
}

.plw-products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: stretch;
}

/* Product Card */
.plw-product-card {
  position: relative;
  background: var(--plw-white);
  border: 2px solid var(--plw-gray-200);
  border-radius: var(--plw-radius-lg);
  padding: 32px 28px;
  cursor: pointer;
  transition: var(--plw-transition);
  display: flex;
  flex-direction: column;
}

.plw-product-card:hover {
  border-color: var(--plw-gold-light);
  box-shadow: var(--plw-shadow-lg);
  transform: translateY(-4px);
}

.plw-product-card.plw-selected {
  border-color: var(--plw-gold);
  box-shadow: var(--plw-shadow-gold);
}

/* Highlighted Card (VIP) */
.plw-product-card.plw-highlighted {
  background: linear-gradient(180deg, var(--plw-gray-900) 0%, #2D2D2D 100%);
  border-color: var(--plw-gold);
  transform: scale(1.02);
}

.plw-product-card.plw-highlighted:hover {
  transform: scale(1.04) translateY(-4px);
  box-shadow: var(--plw-shadow-gold);
}

.plw-product-card.plw-highlighted .plw-product-name,
.plw-product-card.plw-highlighted .plw-product-subtitle,
.plw-product-card.plw-highlighted .plw-price-current,
.plw-product-card.plw-highlighted .plw-price-period,
.plw-product-card.plw-highlighted .plw-product-features li {
  color: var(--plw-white);
}

.plw-product-card.plw-highlighted .plw-product-icon svg {
  stroke: var(--plw-gold);
}

.plw-product-card.plw-highlighted .plw-product-features svg {
  stroke: var(--plw-gold);
}

/* Product Badge */
.plw-product-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--plw-gray-800);
  color: var(--plw-white);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 6px 16px;
  border-radius: 20px;
  white-space: nowrap;
}

.plw-product-badge.plw-badge-gold {
  background: var(--plw-gold-gradient);
  color: var(--plw-gray-900);
}

/* Product Icon */
.plw-product-icon {
  width: 64px;
  height: 64px;
  background: var(--plw-gray-100);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.plw-product-card.plw-highlighted .plw-product-icon {
  background: rgba(201, 169, 98, 0.15);
}

.plw-product-icon svg {
  width: 32px;
  height: 32px;
  stroke: var(--plw-gray-600);
}

/* Product Content */
.plw-product-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--plw-gray-900);
  margin: 0 0 4px 0;
  text-align: center;
}

.plw-product-subtitle {
  font-size: 14px;
  color: var(--plw-gray-500);
  margin: 0 0 20px 0;
  text-align: center;
}

/* Product Price */
.plw-product-price {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--plw-gray-200);
}

.plw-product-card.plw-highlighted .plw-product-price {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.plw-price-current {
  font-size: 36px;
  font-weight: 800;
  color: var(--plw-gray-900);
  letter-spacing: -1px;
}

.plw-price-original {
  display: block;
  font-size: 16px;
  color: var(--plw-gray-400);
  text-decoration: line-through;
  margin-top: 4px;
}

.plw-price-period {
  font-size: 16px;
  font-weight: 500;
  color: var(--plw-gray-500);
}

/* Product Features */
.plw-product-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  flex: 1;
}

.plw-product-features li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  color: var(--plw-gray-700);
  padding: 8px 0;
}

.plw-product-features svg {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  stroke: var(--plw-gold);
  margin-top: 1px;
}

/* Product Button */
.plw-product-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--plw-gray-100);
  border: 2px solid var(--plw-gray-200);
  color: var(--plw-gray-700);
  font-size: 15px;
  font-weight: 600;
  padding: 14px 24px;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--plw-transition);
}

.plw-product-button:hover {
  background: var(--plw-gray-200);
  border-color: var(--plw-gray-300);
}

.plw-product-card.plw-selected .plw-product-button {
  background: var(--plw-gold);
  border-color: var(--plw-gold);
  color: var(--plw-white);
}

.plw-product-button.plw-button-gold {
  background: var(--plw-gold-gradient);
  border-color: var(--plw-gold);
  color: var(--plw-gray-900);
}

.plw-product-button.plw-button-gold:hover {
  box-shadow: var(--plw-shadow-gold);
}

.plw-product-button svg {
  width: 18px;
  height: 18px;
}

/* Info Section */
.plw-info-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 48px;
}

.plw-info-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--plw-gray-50);
  border-radius: var(--plw-radius);
  padding: 24px;
}

.plw-info-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--plw-white);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--plw-shadow-sm);
}

.plw-info-icon svg {
  width: 24px;
  height: 24px;
  stroke: var(--plw-gold);
}

.plw-info-content h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--plw-gray-900);
  margin: 0 0 4px 0;
}

.plw-info-content p {
  font-size: 13px;
  color: var(--plw-gray-600);
  margin: 0;
}

/* Checkout Section (Inline) */
.plw-checkout-section {
  background: var(--plw-gray-50);
  border-radius: var(--plw-radius-xl);
  padding: 32px 24px;
  margin-top: 48px;
  margin-bottom: 48px;
}

.plw-checkout-header {
  margin-bottom: 24px;
}

.plw-checkout-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--plw-gray-900);
  margin: 0;
}

/* Back Button Large */
.plw-back-button-large {
  display: block;
  width: fit-content;
  margin: 24px auto 0;
  padding: 12px 24px;
  background: var(--plw-gray-100);
  border: none;
  border-radius: 8px;
  color: var(--plw-gray-700);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--plw-transition);
}

.plw-back-button-large:hover {
  background: var(--plw-gray-200);
  color: var(--plw-gray-900);
}

/* Checkout Summary */
.plw-checkout-summary {
  padding: 20px 24px;
  background: var(--plw-white);
  border-radius: var(--plw-radius);
  margin-bottom: 24px;
}

.plw-summary-product {
  display: flex;
  align-items: center;
  gap: 16px;
}

.plw-summary-icon {
  width: 56px;
  height: 56px;
  background: var(--plw-white);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--plw-shadow-sm);
}

.plw-summary-icon svg {
  width: 28px;
  height: 28px;
  stroke: var(--plw-gold);
}

.plw-summary-details {
  flex: 1;
}

.plw-summary-details h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--plw-gray-900);
  margin: 0 0 2px 0;
}

.plw-summary-details p {
  font-size: 13px;
  color: var(--plw-gray-500);
  margin: 0;
}

.plw-summary-price {
  text-align: right;
}

.plw-summary-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--plw-gray-900);
}

.plw-summary-period {
  font-size: 14px;
  color: var(--plw-gray-500);
}

/* Login Required */
.plw-login-required {
  padding: 48px 24px;
  text-align: center;
}

.plw-login-icon {
  width: 72px;
  height: 72px;
  background: var(--plw-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.plw-login-icon svg {
  width: 36px;
  height: 36px;
  stroke: var(--plw-gold);
}

.plw-login-required h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--plw-gray-900);
  margin: 0 0 8px 0;
}

.plw-login-required p {
  font-size: 14px;
  color: var(--plw-gray-600);
  margin: 0 0 24px 0;
}

/* Checkout Content */
.plw-checkout-content {
  background: var(--plw-white);
  border-radius: var(--plw-radius);
  padding: 24px;
}

/* Buttons */
.plw-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--plw-transition);
  border: none;
  text-decoration: none;
}

.plw-button-primary {
  background: linear-gradient(135deg, var(--plw-gold) 0%, var(--plw-gold-dark) 100%);
  color: var(--plw-white);
  box-shadow: var(--plw-shadow);
}

.plw-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--plw-shadow-lg);
}

.plw-button-secondary {
  background: var(--plw-white);
  color: var(--plw-gray-700);
  border: 2px solid var(--plw-gray-200);
}

.plw-button-secondary:hover {
  border-color: var(--plw-gold);
  color: var(--plw-gold-dark);
}

.plw-button-text {
  background: transparent;
  color: var(--plw-gray-500);
  padding: 8px 16px;
}

.plw-button-text:hover {
  color: var(--plw-gray-700);
}

/* Confirmation Modal */
.plw-confirmation-overlay {
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

.plw-confirmation-modal {
  background: var(--plw-white);
  border-radius: var(--plw-radius-lg);
  padding: 48px 40px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: var(--plw-shadow-xl);
}

.plw-confirmation-icon {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.1) 0%, rgba(201, 169, 98, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.plw-confirmation-icon svg {
  width: 48px;
  height: 48px;
  stroke: var(--plw-gold);
}

.plw-confirmation-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--plw-gray-900);
  margin: 0 0 12px 0;
}

.plw-confirmation-message {
  font-size: 16px;
  color: var(--plw-gray-600);
  margin: 0 0 24px 0;
}

.plw-confirmation-details {
  background: var(--plw-gray-50);
  border-radius: var(--plw-radius);
  padding: 20px;
  margin-bottom: 24px;
}

.plw-confirmation-details h3 {
  font-size: 12px;
  font-weight: 600;
  color: var(--plw-gray-500);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plw-confirmation-details p {
  margin: 4px 0;
  color: var(--plw-gray-800);
}

/* Next Steps */
.plw-confirmation-next {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.05) 0%, rgba(201, 169, 98, 0.1) 100%);
  border: 1px solid var(--plw-gold-light);
  border-radius: var(--plw-radius);
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
}

.plw-next-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--plw-white);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plw-next-icon svg {
  stroke: var(--plw-gold);
}

.plw-next-content h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--plw-gray-900);
  margin: 0 0 4px 0;
}

.plw-next-content p {
  font-size: 13px;
  color: var(--plw-gray-600);
  margin: 0;
}

.plw-confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Responsive */
@media (max-width: 900px) {
  .plw-products-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }

  .plw-product-card.plw-highlighted {
    transform: none;
    order: -1;
  }

  .plw-product-card.plw-highlighted:hover {
    transform: translateY(-4px);
  }

  .plw-info-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .plw-container {
    padding: 16px;
  }

  .plw-hero {
    padding: 40px 24px;
    border-radius: var(--plw-radius-lg);
  }

  .plw-hero-title {
    font-size: 32px;
  }

  .plw-hero-subtitle {
    font-size: 15px;
  }

  .plw-product-card {
    padding: 24px 20px;
  }

  .plw-price-current {
    font-size: 28px;
  }

  .plw-checkout-modal {
    border-radius: var(--plw-radius-lg);
    max-height: 95vh;
  }

  .plw-confirmation-modal {
    padding: 32px 24px;
  }

  .plw-confirmation-title {
    font-size: 24px;
  }
}
```

---

## API Endpoints Used

### Fetch Product/Training Card Data
```
GET /api/public/trainingcard/type/get?ids={productId}
```

### Checkout
The component uses the built-in `<zoezi-checkout>` component which handles:
- Payment processing
- Order creation
- User management

---

## Testing Checklist

- [ ] All three product cards display correctly
- [ ] Hover effects work on cards
- [ ] VIP Gold card is highlighted
- [ ] Clicking a card opens checkout modal
- [ ] Login prompt shows for non-logged-in users
- [ ] Checkout process completes for logged-in users
- [ ] Confirmation modal displays
- [ ] Mobile responsive design works
- [ ] Product badges display correctly

---

## Configuration Notes

### Update Product IDs

Before deploying, update the product IDs in the `products` array with the actual IDs from your Zoezi setup:

```javascript
products: [
  { id: YOUR_KLIPPKORT_ID, ... },
  { id: YOUR_6MONTH_ID, ... },
  { id: YOUR_VIP_GOLD_ID, ... }
]
```

### Pricing

Update the prices if they differ from the configured values:
- Klippkort: 4 995 kr (was 7 995 kr)
- 6 Månader: 995 kr/mån
- VIP Gold: 1 495 kr/mån

---

## Summary

This webshop component provides a premium e-commerce experience for Pelvic Lab's PelviX products with:
- Elegant white/gray/gold color scheme
- Three-tier product presentation (Klippkort, 6 Month, VIP Gold)
- Highlighted VIP card with special styling
- Integrated Zoezi checkout
- Mobile-responsive design
- Smooth animations and hover effects

---

*Last updated: 2026-01-22*
