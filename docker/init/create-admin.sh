#!/bin/bash
# Create admin user for local Supabase
# Run this once after: docker compose --env-file .env.local up -d

API_URL="http://localhost:8000"
ANON_KEY="${ANON_KEY:-eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3NzU5MTk4MDEsICJleHAiOiAxODkzNDU2MDAwfQ.4ZbJZBE1NoWuJkLxnkgKDR8zO1kTxdtHeH0qJElyVvQ}"
ADMIN_EMAIL="admin@runningclub.local"
ADMIN_PASSWORD="admin123"

echo "Waiting for Supabase Auth to be ready..."
for i in $(seq 1 30); do
    if curl -s "${API_URL}/auth/v1/health" -H "apikey: ${ANON_KEY}" | grep -q "alive"; then
        echo "Auth service is ready!"
        break
    fi
    echo "  Attempt $i/30 - waiting..."
    sleep 3
done

echo ""
echo "Creating admin user: ${ADMIN_EMAIL}"
RESULT=$(curl -s -X POST "${API_URL}/auth/v1/signup" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

if echo "$RESULT" | grep -q "id"; then
    echo "Admin user created successfully!"
    echo ""
    echo "  Email:    ${ADMIN_EMAIL}"
    echo "  Password: ${ADMIN_PASSWORD}"
    echo ""
    echo "Login at: http://localhost:3000/admin.html"
else
    echo "Result: $RESULT"
    echo "(User may already exist - that's OK)"
fi
