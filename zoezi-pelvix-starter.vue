<style lang="scss">
.zoezi-pelvix-starter {
  padding: 20px;
  text-align: center;

  .pelvix-card {
    max-width: 400px;
    margin: 0 auto;
    padding: 30px;
    border-radius: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  }

  .pelvix-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .pelvix-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .pelvix-subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 24px;
  }

  .pelvix-button {
    width: 100%;
    height: 56px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.5px;
    border-radius: 28px;
    text-transform: none;
  }

  .pelvix-button.start {
    background: white !important;
    color: #667eea !important;
  }

  .pelvix-button.success {
    background: #4caf50 !important;
    color: white !important;
  }

  .pelvix-status {
    margin-top: 20px;
    padding: 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.15);
  }

  .pelvix-status-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }

  .pelvix-error {
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    background: rgba(244, 67, 54, 0.2);
    color: #ffcdd2;
    font-size: 14px;
  }

  .user-greeting {
    margin-bottom: 16px;
    font-size: 16px;
    opacity: 0.9;
  }
}
</style>

<template>
  <div class="zoezi-pelvix-starter">
    <!-- Loading state -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64" />
      <div class="mt-4">{{ $translate('Loading...') }}</div>
    </div>

    <!-- Auth check - require login -->
    <template v-else-if="!$store.state.user">
      <zoezi-identification :title="$translate('Please log in to start your PelviX session')" />
    </template>

    <!-- Main content - logged in user -->
    <template v-else>
      <div class="pelvix-card">
        <div class="pelvix-icon">
          <v-icon size="64" color="white">mdi-seat-recline-extra</v-icon>
        </div>

        <div class="user-greeting">
          {{ $translate('Welcome') }}, {{ userName }}!
        </div>

        <div class="pelvix-title">PelviX</div>
        <div class="pelvix-subtitle">{{ $translate('Pelvic floor training system') }}</div>

        <!-- Ready to start state -->
        <template v-if="status === 'ready'">
          <v-btn
            class="pelvix-button start"
            :loading="starting"
            :disabled="starting"
            @click="startPelvix"
          >
            <v-icon left>mdi-play-circle</v-icon>
            {{ $translate('Start PelviX') }}
          </v-btn>
        </template>

        <!-- Started successfully -->
        <template v-else-if="status === 'started'">
          <div class="pelvix-status">
            <div class="pelvix-status-icon">
              <v-icon size="48" color="white">mdi-check-circle</v-icon>
            </div>
            <div class="font-weight-bold">{{ $translate('Device unlocked!') }}</div>
            <div class="mt-2" style="font-size: 14px; opacity: 0.9;">
              {{ $translate('Please take a seat in the PelviX chair to begin your session.') }}
            </div>
          </div>
          <v-btn
            class="pelvix-button mt-4"
            outlined
            dark
            @click="resetStatus"
          >
            {{ $translate('Start new session') }}
          </v-btn>
        </template>

        <!-- Error state -->
        <template v-else-if="status === 'error'">
          <div class="pelvix-error">
            <v-icon color="#ffcdd2" small>mdi-alert-circle</v-icon>
            {{ errorMessage }}
          </div>
          <v-btn
            class="pelvix-button start mt-4"
            @click="resetStatus"
          >
            {{ $translate('Try again') }}
          </v-btn>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'zoezi-pelvix-starter',

  zoezi: {
    title: 'PelviX Starter',
    icon: 'mdi-seat-recline-extra',
    addon: null
  },

  props: {
    // Backend API URL - configure in page builder
    apiUrl: {
      title: 'Backend API URL',
      type: String,
      default: 'https://your-replit-url.replit.app'
    }
  },

  data: () => ({
    loading: false,
    starting: false,
    status: 'ready', // 'ready', 'started', 'error'
    errorMessage: ''
  }),

  computed: {
    userName() {
      const user = this.$store.state.user;
      if (!user) return '';
      return user.firstName || user.name || user.email || '';
    },

    userId() {
      const user = this.$store.state.user;
      return user ? (user.id || user.userId || user.email) : null;
    },

    userFullName() {
      const user = this.$store.state.user;
      if (!user) return '';
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.name || user.firstName || user.email || '';
    }
  },

  methods: {
    async startPelvix() {
      if (!this.userId) {
        this.status = 'error';
        this.errorMessage = this.$translate('User not logged in');
        return;
      }

      this.starting = true;
      this.errorMessage = '';

      try {
        // Call our backend API to unlock the PelviX device
        const response = await fetch(`${this.apiUrl}/api/start-pelvix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patientId: String(this.userId),
            patientName: this.userFullName,
            transactionId: `zoezi-${this.userId}-${Date.now()}`
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          this.status = 'started';
        } else {
          this.status = 'error';
          this.errorMessage = data.error || this.$translate('Failed to start PelviX session');
        }
      } catch (error) {
        console.error('PelviX start error:', error);
        this.status = 'error';
        this.errorMessage = this.$translate('Connection error. Please try again.');
      } finally {
        this.starting = false;
      }
    },

    resetStatus() {
      this.status = 'ready';
      this.errorMessage = '';
    }
  }
}
</script>
