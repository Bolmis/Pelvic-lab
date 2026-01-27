# Pelvic Lab Documentation

## Overview
This project serves as a documentation site for Pelvic Lab, containing component specifications, API documentation, and customer information for their PelviX pelvic floor treatment services.

## Project Structure
- `server.js` - Express server that renders markdown files as HTML pages
- `pelvic-lab-info.md` - Customer information about Pelvic Lab services
- `pelviclab-booking-component.md` - Vue.js component specification for booking system
- `pelviclab-webshop-component.md` - Vue.js component specification for webshop
- `pelvic-api-docs.md` - API integration documentation for PonteMed/Pelvipower devices
- `Produkter (4).xlsx` - Product data spreadsheet
- `Resursbokningstjänster (4).xlsx` - Resource booking services spreadsheet

## Tech Stack
- Node.js 20
- Express.js - Web server
- Marked - Markdown to HTML conversion

## Running the Project
The documentation server runs on port 5000:
```bash
node server.js
```

## Routes
- `/info` - Customer Information
- `/booking` - Booking Component specification
- `/webshop` - Webshop Component specification
- `/api` - API Documentation

---
*Last updated: 2026-01-27*
