const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

// =============================================================================
// Email Configuration
// =============================================================================

const ADMIN_EMAIL = 'anton@strongsales.se';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendNotificationEmail(subject, htmlContent) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipping email - credentials not configured');
    return;
  }

  try {
    await transporter.sendMail({
      from: `PelviX Notifications <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: subject,
      html: htmlContent,
    });
    console.log(`[Email] Notification sent to ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('[Email] Failed to send notification:', error.message);
  }
}

// =============================================================================
// Zoezi API Configuration
// =============================================================================

const ZOEZI_API_KEY = process.env.ZOEZI_API_KEY;
const ZOEZI_DOMAIN = 'pelviclab.zoezi.se';

async function verifyActiveResourceBooking(userId) {
  if (!ZOEZI_API_KEY) {
    throw new Error('Missing Zoezi API key. Set ZOEZI_API_KEY in Replit Secrets.');
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const url = `https://${ZOEZI_DOMAIN}/api/resourcebooking/get/booked?startTime=${today}&endTime=${tomorrow}`;

  console.log(`[Zoezi] Fetching bookings for verification...`);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': ZOEZI_API_KEY
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zoezi API error: ${response.status} - ${errorText}`);
  }

  const bookings = await response.json();

  if (!Array.isArray(bookings) || bookings.length === 0) {
    console.log('[Zoezi] No bookings found for today');
    return { hasActiveBooking: false, booking: null };
  }

  // Find active booking for this user
  // Active = (start time - 5 min) <= now <= (start time + duration)
  const earlyStartMinutes = 5;

  // Get current time in Stockholm timezone for comparison
  const nowStockholm = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }));
  console.log(`[Zoezi] Current time (Stockholm): ${nowStockholm.toLocaleString('sv-SE')}`);

  for (const booking of bookings) {
    if (booking.user_id !== parseInt(userId) && String(booking.user_id) !== String(userId)) {
      continue;
    }

    if (booking.cancelled) {
      continue;
    }

    // booking.time is in Stockholm local time (e.g., "2026-01-28 10:00:00")
    // Parse it directly as local time components
    const [datePart, timePart] = booking.time.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    // Create dates using local time components for comparison
    const bookingStart = new Date(year, month - 1, day, hour, minute, second || 0);
    const duration = booking.duration || 60;
    const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 1000);
    const earlyStart = new Date(bookingStart.getTime() - earlyStartMinutes * 60 * 1000);

    console.log(`[Zoezi] Checking booking: ${booking.time}, duration: ${duration}min, user: ${booking.user_id}`);
    console.log(`[Zoezi]   Early start: ${earlyStart.toLocaleString('sv-SE')}, End: ${bookingEnd.toLocaleString('sv-SE')}, Now: ${nowStockholm.toLocaleString('sv-SE')}`);

    if (nowStockholm >= earlyStart && nowStockholm <= bookingEnd) {
      console.log('[Zoezi] Found active booking!');
      return { hasActiveBooking: true, booking: booking };
    }
  }

  console.log(`[Zoezi] No active booking found for user ${userId}`);
  return { hasActiveBooking: false, booking: null };
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS middleware for Zoezi frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =============================================================================
// Pelvipower API Configuration
// =============================================================================

// Environment: 'development' or 'production'
const PELVIC_ENV = process.env.PELVIC_ENV || 'development';

const PELVIC_CONFIG = {
  development: {
    baseUrl: 'https://dev.pelvipower.io',
    tokenUrl: 'https://login.dev.pelvipower.io/realms/ThirdParty/protocol/openid-connect/token'
  },
  production: {
    baseUrl: 'https://pelvipower.io',
    tokenUrl: 'https://login.pelvipower.io/realms/ThirdParty/protocol/openid-connect/token'
  }
};

const config = PELVIC_CONFIG[PELVIC_ENV];

// Credentials from Replit Secrets
const CLIENT_ID = process.env.PELVIC_CLIENT_ID;
const CLIENT_SECRET = process.env.PELVIC_CLIENT_SECRET;
const DEVICE_SERIAL_NUMBER = process.env.PELVIC_DEVICE_SERIAL_NUMBER;

// Token cache
let cachedToken = null;
let tokenExpiry = null;

// =============================================================================
// Pelvipower API Functions
// =============================================================================

async function getAccessToken() {
  // Return cached token if still valid (with 30 second buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 30000) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing Pelvipower API credentials. Set PELVIC_CLIENT_ID and PELVIC_CLIENT_SECRET in Replit Secrets.');
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to obtain access token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);

  console.log(`[Pelvipower] Access token obtained, expires in ${data.expires_in}s`);
  return cachedToken;
}

async function unlockDevice(patientId, patientName, transactionId, remainingUnits = 10) {
  if (!DEVICE_SERIAL_NUMBER) {
    throw new Error('Missing device serial number. Set PELVIC_DEVICE_SERIAL_NUMBER in Replit Secrets.');
  }

  const token = await getAccessToken();

  const payload = {
    deviceSerialNumber: DEVICE_SERIAL_NUMBER,
    patientId: patientId,
    patientName: patientName,
    remainingTrainingUnits: remainingUnits,
    availableTreatments: null,
    presets: {},
    unlockTimeOutInSeconds: 300,
    graphicBase64: null,
    transactionId: transactionId
  };

  const unlockUrl = `${config.baseUrl}/api/command/unlock`;
  console.log(`[Pelvipower] Unlocking device for patient: ${patientName} (${patientId})`);
  console.log(`[Pelvipower] URL: ${unlockUrl}`);

  const response = await fetch(unlockUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to unlock device: ${response.status} - ${errorText}`);
  }

  console.log(`[Pelvipower] Device unlocked successfully for ${patientName}`);
  return { success: true };
}

// =============================================================================
// API Endpoints
// =============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: PELVIC_ENV,
    hasCredentials: !!(CLIENT_ID && CLIENT_SECRET && DEVICE_SERIAL_NUMBER)
  });
});

// Start PelviX session - called by the Zoezi component
app.post('/api/start-pelvix', async (req, res) => {
  const startTime = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });
  let patientId, patientName, transactionId;

  try {
    ({ patientId, patientName, transactionId } = req.body);

    if (!patientId || !patientName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientId and patientName'
      });
    }

    const txnId = transactionId || `session-${patientId}-${Date.now()}`;

    // Step 1: Verify active resourcebooking via Zoezi API
    console.log(`[PelviX] Verifying booking for user ${patientId} (${patientName})`);
    const { hasActiveBooking, booking } = await verifyActiveResourceBooking(patientId);

    if (!hasActiveBooking) {
      const errorMsg = 'Ingen aktiv bokning hittades. Du kan endast starta stolen under din bokade tid.';
      console.log(`[PelviX] No active booking for ${patientName} (${patientId})`);

      // Send error email
      await sendNotificationEmail(
        `❌ PelviX Start NEKAD - ${patientName}`,
        `
        <h2 style="color: #e74c3c;">PelviX Start Nekad</h2>
        <p><strong>Tid:</strong> ${startTime}</p>
        <p><strong>Användare:</strong> ${patientName}</p>
        <p><strong>Användar-ID:</strong> ${patientId}</p>
        <p><strong>Anledning:</strong> Ingen aktiv resursbokning hittades</p>
        <hr>
        <p style="color: #7f8c8d; font-size: 12px;">Användaren försökte starta PelviX utan giltig bokning.</p>
        `
      );

      return res.status(403).json({
        success: false,
        error: errorMsg
      });
    }

    // Step 2: Unlock the device
    console.log(`[PelviX] Booking verified, unlocking device for ${patientName}`);
    await unlockDevice(patientId, patientName, txnId);

    // Step 3: Send success email
    const bookingTime = booking ? booking.time : 'Unknown';
    const bookingDuration = booking ? (booking.duration || 60) : 60;

    await sendNotificationEmail(
      `✅ PelviX Startad - ${patientName}`,
      `
      <h2 style="color: #27ae60;">PelviX Startad Framgångsrikt</h2>
      <p><strong>Tid:</strong> ${startTime}</p>
      <p><strong>Användare:</strong> ${patientName}</p>
      <p><strong>Användar-ID:</strong> ${patientId}</p>
      <p><strong>Transaktion:</strong> ${txnId}</p>
      <hr>
      <h3>Bokningsdetaljer</h3>
      <p><strong>Bokad tid:</strong> ${bookingTime}</p>
      <p><strong>Längd:</strong> ${bookingDuration} minuter</p>
      <hr>
      <p style="color: #7f8c8d; font-size: 12px;">Stolen är upplåst och redo för behandling.</p>
      `
    );

    res.json({
      success: true,
      message: 'Device unlocked successfully',
      transactionId: txnId
    });

  } catch (error) {
    console.error('[PelviX] Error:', error.message);

    // Send error email
    await sendNotificationEmail(
      `❌ PelviX FEL - ${patientName || 'Okänd'}`,
      `
      <h2 style="color: #e74c3c;">PelviX Fel</h2>
      <p><strong>Tid:</strong> ${startTime}</p>
      <p><strong>Användare:</strong> ${patientName || 'Okänd'}</p>
      <p><strong>Användar-ID:</strong> ${patientId || 'Okänt'}</p>
      <hr>
      <h3>Felmeddelande</h3>
      <p style="color: #e74c3c; background: #fdf2f2; padding: 10px; border-radius: 4px;">${error.message}</p>
      <hr>
      <p style="color: #7f8c8d; font-size: 12px;">Ett fel uppstod vid försök att starta PelviX.</p>
      `
    );

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook endpoint for Pelvipower events
app.post('/api/webhook/pelvic', (req, res) => {
  console.log('[Pelvipower Webhook] Received event:', JSON.stringify(req.body, null, 2));

  // Process webhook events here
  // Events include: Treatment_Start, Treatment_Stop, Treatment_Pause, etc.

  res.sendStatus(200);
});

const htmlTemplate = (title, content, sidebar) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Pelvic Lab Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 1.5rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header h1 {
            font-size: 1.8rem;
            font-weight: 600;
        }
        .header p {
            opacity: 0.9;
            font-size: 0.9rem;
        }
        .container {
            display: flex;
            max-width: 1400px;
            margin: 0 auto;
            min-height: calc(100vh - 100px);
        }
        .sidebar {
            width: 280px;
            background: white;
            padding: 1.5rem;
            border-right: 1px solid #e0e0e0;
            position: sticky;
            top: 0;
            height: fit-content;
        }
        .sidebar h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .sidebar ul {
            list-style: none;
        }
        .sidebar li {
            margin-bottom: 0.5rem;
        }
        .sidebar a {
            color: #555;
            text-decoration: none;
            display: block;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            transition: all 0.2s;
            font-size: 0.95rem;
        }
        .sidebar a:hover, .sidebar a.active {
            background: #e8f4fd;
            color: #2980b9;
        }
        .content {
            flex: 1;
            padding: 2rem 3rem;
            background: white;
            max-width: 900px;
        }
        .content h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
        }
        .content h2 {
            color: #34495e;
            margin-top: 2rem;
            margin-bottom: 1rem;
            padding-bottom: 0.3rem;
            border-bottom: 1px solid #eee;
        }
        .content h3 {
            color: #555;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        .content p {
            margin-bottom: 1rem;
        }
        .content ul, .content ol {
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }
        .content li {
            margin-bottom: 0.5rem;
        }
        .content pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 1rem 1.25rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
            font-size: 0.9rem;
        }
        .content code {
            background: #f1f5f9;
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-size: 0.9em;
            color: #e74c3c;
        }
        .content pre code {
            background: transparent;
            color: inherit;
            padding: 0;
        }
        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        .content th, .content td {
            border: 1px solid #ddd;
            padding: 0.75rem;
            text-align: left;
        }
        .content th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .content blockquote {
            border-left: 4px solid #3498db;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #666;
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 0 8px 8px 0;
        }
        .content hr {
            border: none;
            border-top: 1px solid #eee;
            margin: 2rem 0;
        }
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            .sidebar {
                width: 100%;
                border-right: none;
                border-bottom: 1px solid #e0e0e0;
            }
            .content {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Pelvic Lab Documentation</h1>
        <p>Component specifications, API documentation, and customer information</p>
    </div>
    <div class="container">
        <nav class="sidebar">
            <h3>Documentation</h3>
            ${sidebar}
        </nav>
        <main class="content">
            ${content}
        </main>
    </div>
</body>
</html>
`;

const docs = [
    { file: 'pelvic-lab-info.md', title: 'Customer Information', slug: 'info' },
    { file: 'pelviclab-booking-component.md', title: 'Booking Component', slug: 'booking' },
    { file: 'pelviclab-webshop-component.md', title: 'Webshop Component', slug: 'webshop' },
    { file: 'pelvic-api-docs.md', title: 'API Documentation', slug: 'api' },
    { file: 'zoezi-pelvix-starter-COMPLETE.md', title: 'PelviX Starter Component', slug: 'pelvix-starter' }
];

const generateSidebar = (activeSlug) => {
    return '<ul>' + docs.map(doc => 
        `<li><a href="/${doc.slug}" class="${doc.slug === activeSlug ? 'active' : ''}">${doc.title}</a></li>`
    ).join('') + '</ul>';
};

app.get('/', (req, res) => {
    res.redirect('/info');
});

docs.forEach(doc => {
    app.get(`/${doc.slug}`, (req, res) => {
        try {
            const markdown = fs.readFileSync(path.join(__dirname, doc.file), 'utf-8');
            const content = marked(markdown);
            const sidebar = generateSidebar(doc.slug);
            res.set('Cache-Control', 'no-cache');
            res.send(htmlTemplate(doc.title, content, sidebar));
        } catch (error) {
            res.status(500).send('Error loading documentation');
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pelvic Lab server running at http://0.0.0.0:${PORT}`);
    console.log(`  - Documentation: http://0.0.0.0:${PORT}/`);
    console.log(`  - API Health: http://0.0.0.0:${PORT}/api/health`);
    console.log(`  - Environment: ${PELVIC_ENV}`);
});
