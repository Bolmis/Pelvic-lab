#!/bin/bash

# =============================================================================
# PelviX Unlock Test Script
# =============================================================================
# Usage: bash test-unlock.sh
#
# Prerequisites:
#   - Set PELVIC_CLIENT_ID and PELVIC_CLIENT_SECRET as environment variables
#   - Set PELVIC_DEVICE_SERIAL_NUMBER as environment variable
#
# Example:
#   export PELVIC_CLIENT_ID="your-client-id"
#   export PELVIC_CLIENT_SECRET="your-client-secret"
#   export PELVIC_DEVICE_SERIAL_NUMBER="your-serial-number"
#   bash test-unlock.sh
# =============================================================================

echo "=== Step 1: Obtain Access Token ==="

TOKEN_RESPONSE=$(curl -s -X POST \
  "https://login.dev.pelvipower.io/realms/ThirdParty/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${PELVIC_CLIENT_ID}&client_secret=${PELVIC_CLIENT_SECRET}&grant_type=client_credentials")

echo "Token response:"
echo "$TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOKEN_RESPONSE"

# Extract access_token
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: Failed to obtain access token"
  exit 1
fi

echo ""
echo "Access token obtained successfully"
echo ""

echo "=== Step 2: Unlock Device ==="

UNLOCK_RESPONSE=$(curl -s -w "\n\nHTTP Status: %{http_code}" -X POST \
  "https://middleware.dev.pelvipower.io/command/unlock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "deviceSerialNumber": "'"${PELVIC_DEVICE_SERIAL_NUMBER}"'",
    "patientId": "test-patient-1",
    "patientName": "Test Patient",
    "remainingTrainingUnits": 10,
    "availableTreatments": null,
    "presets": {},
    "unlockTimeOutInSeconds": 300,
    "graphicBase64": null,
    "transactionId": "test-'"$(date +%s)"'"
  }')

echo "Unlock response:"
echo "$UNLOCK_RESPONSE"
