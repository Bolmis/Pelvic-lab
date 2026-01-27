# Pelvic API Integration Documentation

## Overview

This document describes the integration with the PonteMed/Pelvipower ThirdParty Middleware API for controlling and monitoring Pelvic treatment devices.

---

## Environments

| Environment | Base URL | Token URL |
|-------------|----------|-----------|
| Development | `https://dev.pelvipower.io` | `https://login.dev.pelvipower.io/realms/ThirdParty/protocol/openid-connect/token` |
| Production | `https://pelvipower.io` | `https://login.pelvipower.io/realms/ThirdParty/protocol/openid-connect/token` |

> **Note:** Devices must be provisioned by PonteMed to work in either environment. Contact them to configure a device for third-party mode.

---

## Authentication

The API uses OAuth2 Client Credentials flow.

### Obtaining an Access Token

**Request:**
```http
POST /realms/ThirdParty/protocol/openid-connect/token
Host: login.dev.pelvipower.io
Content-Type: application/x-www-form-urlencoded

client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&grant_type=client_credentials
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "token_type": "Bearer"
}
```

### Using the Token

Include the access token in all API requests:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Endpoints

### Health Check

Check if the API is available.

```http
GET /health
```

**Response:** `200 OK` with a string message.

---

### Devices

#### List Connected Devices

Retrieve all devices linked to your account.

```http
GET /device?offset=0&limit=10
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `offset` | integer | Pagination offset |
| `limit` | integer | Number of results to return |

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "serialNumber": "PEL-12345",
      "model": "Pelvipower Model X"
    }
  ],
  "total": 1
}
```

> **Note:** The `serialNumber` is printed on the back of the physical device.

---

#### Get Device Sessions

Retrieve treatment sessions for a specific device.

```http
GET /device/{deviceId}/sessions?fromDate=2024-01-01T00:00:00Z&toDate=2024-12-31T23:59:59Z&offset=0&limit=10
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `deviceId` | UUID | The device ID (from `/device` response) |

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `fromDate` | datetime | Filter sessions from this date (ISO 8601) |
| `toDate` | datetime | Filter sessions until this date (ISO 8601) |
| `offset` | integer | Pagination offset |
| `limit` | integer | Number of results to return |

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "serialNumber": "PEL-12345",
      "transactionId": "txn-abc-123",
      "customerId": "customer-001",
      "customerName": "John Doe",
      "sessionStart": "2024-06-15T10:00:00Z",
      "sessionEnd": "2024-06-15T10:30:00Z",
      "treatmentName": "Standard Treatment"
    }
  ],
  "total": 1
}
```

---

### Commands

#### Unlock Device

Unlock a device for a patient to start a treatment session.

```http
POST /command/unlock
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceSerialNumber": "PEL-12345",
  "patientId": "customer-001",
  "patientName": "John Doe",
  "remainingTrainingUnits": 10,
  "availableTreatments": null,
  "presets": {
    "intensity": "medium",
    "duration": "30"
  },
  "unlockTimeOutInSeconds": 300,
  "graphicBase64": null,
  "transactionId": "txn-abc-123"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceSerialNumber` | string | ✅ | Serial number printed on device |
| `patientId` | string | ✅ | Your internal customer/patient ID |
| `patientName` | string | ✅ | Name displayed on device screen |
| `remainingTrainingUnits` | integer | ✅ | Remaining sessions for the patient |
| `availableTreatments` | int[] | ❌ | *Not currently implemented* |
| `presets` | object | ❌ | Key-value pairs for treatment presets |
| `unlockTimeOutInSeconds` | integer | ❌ | Auto-lock timeout if session not started |
| `graphicBase64` | string | ❌ | Custom graphic to display (base64 encoded) |
| `transactionId` | string | ❌ | Your reference ID for this session |

**Response:** `200 OK`

---

#### Abort/Lock Device

Lock the device or abort an ongoing session.

```http
POST /command/abort
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceSerialNumber": "PEL-12345",
  "graphicBase64": null
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceSerialNumber` | string | ✅ | Serial number of device to lock |
| `graphicBase64` | string | ❌ | Custom graphic to display (base64 encoded) |

**Response:** `200 OK`

---

### Webhooks

Webhooks allow you to receive real-time events from devices.

#### Get Current Webhook Configuration

```http
GET /webhook
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "url": "https://your-server.com/webhook/pelvic"
}
```

---

#### Set Webhook URL

```http
PUT /webhook
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://your-server.com/webhook/pelvic"
}
```

**Response:** `200 OK`

---

#### Set Webhook API Key

Secure your webhook endpoint with an API key. The API will include this key in the `X-API-KEY` header when calling your webhook.

```http
POST /webhook/apikey
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldApiKey": "",
  "newApiKey": "your-secure-api-key"
}
```

> **Note:** Leave `oldApiKey` empty for initial setup.

**Response:** `200 OK`

---

#### Test Webhook

Send a test payload to your configured webhook.

```http
POST /test-webhook
Content-Type: application/json
```

**Request Body:** Same structure as `DeviceLogEntries` (see below).

---

### Webhook Payload Structure

When events occur on a device, your webhook receives a `DeviceLogEntries` payload:

```json
{
  "serialNumber": "PEL-12345",
  "treatmentId": 1,
  "transactionId": "txn-abc-123",
  "entries": [
    {
      "createdAt": "2024-06-15T10:05:00Z",
      "event": "Treatment_Start",
      "additionalValue": null
    },
    {
      "createdAt": "2024-06-15T10:35:00Z",
      "event": "Treatment_Stop",
      "additionalValue": null
    }
  ]
}
```

---

## Device Events

The following events can be received via webhook:

### System Events
| Event | Description |
|-------|-------------|
| `System_Heartbeat` | Periodic heartbeat signal |
| `System_Initialize_Ready` | Device ready to initialize |
| `System_Initialize_Start` | Initialization started |
| `System_Initialize_Done` | Initialization completed |
| `System_ReadyToUnlock` | Device ready to be unlocked |

### Card Detection
| Event | Description |
|-------|-------------|
| `CardDetection_MasterKeyCard` | Master key card detected |

### Coil Position
| Event | Description |
|-------|-------------|
| `CoilPosition_PositionBackSelected` | Back position selected |
| `CoilPosition_PositionCenterSelected` | Center position selected |
| `CoilPosition_PositionFrontSelected` | Front position selected |

### Treatment Flow
| Event | Description |
|-------|-------------|
| `ContraIndications_Accepted` | Patient accepted contraindications |
| `Treatment_Start` | Treatment session started |
| `Treatment_Pause` | Treatment paused |
| `Treatment_Stop` | Treatment stopped |
| `Treatment_NextSequenceStart` | Next treatment sequence started |
| `Treatment_ReturnToLockScreen` | Returned to lock screen |

### Treatment Settings Adjustments
| Event | Description |
|-------|-------------|
| `TreatmentSettings_IntensityUp` | Intensity increased |
| `TreatmentSettings_IntensityDown` | Intensity decreased |
| `TreatmentSettings_MoveCoilForward` | Coil moved forward |
| `TreatmentSettings_MoveCoilBackward` | Coil moved backward |
| `TreatmentSettings_ResetProgram` | Program reset |
| `TreatmentSettings_FrequencyUp` | Frequency increased |
| `TreatmentSettings_FrequencyDown` | Frequency decreased |
| `TreatmentSettings_ResetFrequency` | Frequency reset |
| `TreatmentSettings_BackPositionUp` | Back position raised |
| `TreatmentSettings_BackPositionDown` | Back position lowered |
| `TreatmentSettings_FootPositionUp` | Foot position raised |
| `TreatmentSettings_FootPositionDown` | Foot position lowered |
| `TreatmentSettings_ChangeSignalDuration` | Signal duration changed |
| `TreatmentSettings_BurstOnTimeSecUp` | Burst on-time increased |
| `TreatmentSettings_BurstOnTimeSecDown` | Burst on-time decreased |
| `TreatmentSettings_BurstOffTimeSecUp` | Burst off-time increased |
| `TreatmentSettings_BurstOffTimeSecDown` | Burst off-time decreased |
| `TreatmentSettings_ChangeCoilStartPositionToBack` | Coil start position set to back |
| `TreatmentSettings_ChangeCoilStartPositionToCenter` | Coil start position set to center |
| `TreatmentSettings_ChangeCoilStartPositionToFront` | Coil start position set to front |

### Feedback
| Event | Description |
|-------|-------------|
| `Goodbye_Rating` | Patient provided session rating (value in `additionalValue`) |

---

## Error Codes

| Code | Description |
|------|-------------|
| `General` | General error |
| `BookingNotPayed` | Booking has not been paid |
| `BookingWasAlreadyCanceled` | Booking was already canceled |
| `BookingFeedbackAlreadyGiven` | Feedback already submitted |
| `BookingNotPossible` | Booking not possible |
| `PackagePriceCanNotBeNegative` | Package price cannot be negative |
| `PackageCreditsNotValid` | Package credits invalid |
| `PackageNotDeleteAble` | Package cannot be deleted |
| `PackageNotUseableForLocation` | Package not valid for this location |
| `PackageNoValidAvailable` | No valid package available |
| `PackageMaximumLimitReached` | Package limit reached |
| `LocationTrainingPriceNotValid` | Training price invalid |
| `LocationProvisionPriceNotValid` | Provision price invalid |
| `LocationLastOpeningHoursNotDeletable` | Cannot delete last opening hours |
| `LocationNotInitializable` | Location cannot be initialized |
| `LocationOpeningHoursCollision` | Opening hours conflict |
| `LocationOpeningHoursUpdateNotPossible` | Cannot update opening hours |
| `TrainingNotStartable` | Training cannot be started |

---

## Typical Integration Flow

```
┌─────────────────┐     1. Authenticate      ┌─────────────────┐
│   Your System   │ ───────────────────────► │   Auth Server   │
└─────────────────┘                          └─────────────────┘
        │                                            │
        │◄────────── 2. Access Token ────────────────┘
        │
        │          3. POST /command/unlock
        │         (when customer checks in)
        ▼
┌─────────────────┐                          ┌─────────────────┐
│   Pelvic API    │ ───────────────────────► │  Pelvic Device  │
└─────────────────┘      4. Unlock           └─────────────────┘
        │                                            │
        │                                            │
        │◄──────── 5. Webhook Events ────────────────┘
        │         (Treatment_Start, etc.)
        │
        ▼
┌─────────────────┐
│   Your System   │  6. Update customer records,
│   (Webhook)     │     track usage, etc.
└─────────────────┘
```

---

## Postman Collection Setup

1. Create environment variables:
   - `base_url`: `https://dev.pelvipower.io`
   - `token_url`: `https://login.dev.pelvipower.io/realms/ThirdParty/protocol/openid-connect/token`
   - `client_id`: Your client ID
   - `client_secret`: Your client secret
   - `access_token`: (populated by auth request)

2. Create a pre-request script for authentication:
```javascript
const tokenUrl = pm.environment.get('token_url');
const clientId = pm.environment.get('client_id');
const clientSecret = pm.environment.get('client_secret');

pm.sendRequest({
    url: tokenUrl,
    method: 'POST',
    header: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
        mode: 'urlencoded',
        urlencoded: [
            { key: 'client_id', value: clientId },
            { key: 'client_secret', value: clientSecret },
            { key: 'grant_type', value: 'client_credentials' }
        ]
    }
}, function (err, res) {
    if (!err) {
        const token = res.json().access_token;
        pm.environment.set('access_token', token);
    }
});
```

3. Set Authorization header for all requests:
```
Authorization: Bearer {{access_token}}
```

---

## Contact

For device provisioning or API access, contact PonteMed/Pelvipower support.
