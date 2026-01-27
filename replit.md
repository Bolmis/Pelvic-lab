# Pelvic Lab Documentation & API Server

## Overview
This project serves as both a documentation site and API backend for Pelvic Lab, containing component specifications, API documentation, and the PelviX device integration for their pelvic floor treatment services.

## Project Structure
- `server.js` - Express server with documentation rendering and Pelvipower API integration
- `zoezi-pelvix-starter.vue` - Zoezi component for starting PelviX sessions
- `zoezi-pelvix-starter-docs.md` - Documentation for the PelviX Starter component
- `pelvic-lab-info.md` - Customer information about Pelvic Lab services
- `pelviclab-booking-component.md` - Vue.js component specification for booking system
- `pelviclab-webshop-component.md` - Vue.js component specification for webshop
- `pelvic-api-docs.md` - API integration documentation for PonteMed/Pelvipower devices
- `claude.md` - Instructions for AI assistants working on Zoezi components
- `Produkter (4).xlsx` - Product data spreadsheet
- `Resursbokningstjänster (4).xlsx` - Resource booking services spreadsheet

## Tech Stack
- Node.js 20
- Express.js - Web server & API
- Marked - Markdown to HTML conversion

## Required Secrets

Add these in Replit's Secrets tab (Tools > Secrets):

| Secret Name | Description |
|-------------|-------------|
| `PELVIC_CLIENT_ID` | Pelvipower OAuth2 client ID |
| `PELVIC_CLIENT_SECRET` | Pelvipower OAuth2 client secret |
| `PELVIC_DEVICE_SERIAL_NUMBER` | Device serial number (printed on device) |
| `PELVIC_ENV` | `development` or `production` (default: development) |

## Running the Project
The server runs on port 5000:
```bash
node server.js
```

## Routes

### Documentation
- `/` - Redirects to /info
- `/info` - Customer Information
- `/booking` - Booking Component specification
- `/webshop` - Webshop Component specification
- `/api` - API Documentation
- `/pelvix-starter` - PelviX Starter Component documentation

### API Endpoints
- `GET /api/health` - Health check (shows credential status)
- `POST /api/start-pelvix` - Start a PelviX session (unlocks device)
- `POST /api/webhook/pelvic` - Webhook for Pelvipower events

## API Usage

### Start PelviX Session
```bash
curl -X POST https://your-replit-url.replit.app/api/start-pelvix \
  -H "Content-Type: application/json" \
  -d '{"patientId": "user-123", "patientName": "John Doe"}'
```

### Health Check
```bash
curl https://your-replit-url.replit.app/api/health
```

## Zoezi Component Integration

The `zoezi-pelvix-starter.vue` component is designed to be used in the Zoezi page builder at `pelviclab.zoezi.se`. Configure the `apiUrl` prop to point to this Replit deployment.

---
*Last updated: 2026-01-27*
