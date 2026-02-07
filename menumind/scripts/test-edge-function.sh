#!/bin/bash
# Test the analyze-menu Edge Function from the command line.
# Usage:
#   ./scripts/test-edge-function.sh                    # health check only
#   ./scripts/test-edge-function.sh /path/to/menu.jpg  # full analysis test
#
# Requires: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
# Either export them or create a .env file in the menumind directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
fi

SUPABASE_URL="${EXPO_PUBLIC_SUPABASE_URL:-}"
ANON_KEY="${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$ANON_KEY" ]; then
  echo "ERROR: Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
  echo "Either export them or add to $PROJECT_DIR/.env"
  exit 1
fi

FUNCTION_URL="$SUPABASE_URL/functions/v1/analyze-menu"

echo "=== Edge Function Health Check ==="
echo "URL: $FUNCTION_URL"
echo ""

HEALTH=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$FUNCTION_URL")
HTTP_BODY=$(echo "$HEALTH" | sed '/^HTTP_STATUS:/d')
HTTP_CODE=$(echo "$HEALTH" | grep "HTTP_STATUS:" | cut -d: -f2)

echo "Status: $HTTP_CODE"
echo "Response: $HTTP_BODY"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
  echo "FAIL: Health check returned $HTTP_CODE (expected 200)"
  echo "The Edge Function may not be deployed or needs redeployment."
  exit 1
fi

echo "OK: Edge Function is running"
echo ""

# If no image argument, stop here
if [ -z "${1:-}" ]; then
  echo "To run a full test, pass an image path:"
  echo "  $0 /path/to/menu.jpg"
  exit 0
fi

IMAGE_PATH="$1"
if [ ! -f "$IMAGE_PATH" ]; then
  echo "ERROR: File not found: $IMAGE_PATH"
  exit 1
fi

echo "=== Full Analysis Test ==="
echo "Image: $IMAGE_PATH"
echo "Size: $(wc -c < "$IMAGE_PATH") bytes"
echo ""

# Encode image to base64
echo "Encoding image to base64..."
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_PATH" 2>/dev/null || base64 -i "$IMAGE_PATH" 2>/dev/null)
echo "Base64 length: ${#IMAGE_BASE64} chars"
echo ""

# Build the request body
BODY=$(cat <<ENDJSON
{
  "scanId": "test-$(date +%s)",
  "imageBase64": "$IMAGE_BASE64",
  "dietaryProfile": {
    "allergies": ["peanuts"],
    "dietTypes": ["vegetarian"],
    "severityLevels": {"peanuts": "severe"},
    "customRestrictions": []
  }
}
ENDJSON
)

echo "Sending to Edge Function..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -d "$BODY" \
  "$FUNCTION_URL")

RESP_BODY=$(echo "$RESPONSE" | sed '/^HTTP_STATUS:/d')
RESP_CODE=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

echo "Status: $RESP_CODE"
echo "Response:"
echo "$RESP_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESP_BODY"
