#!/bin/bash

echo "Testing Risk Documentation Hub Deployment"
echo "========================================="

SITE_URL="https://risk.johnnycchung.com"

echo -e "\n1. Testing root page:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$SITE_URL/"

echo -e "\n2. Testing API endpoints:"
echo "- test-db endpoint:"
curl -s "$SITE_URL/api/test-db" | head -100

echo -e "\n\n- direct-init endpoint:"
curl -s "$SITE_URL/api/direct-init" | head -100

echo -e "\n\n- initialize-database page:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$SITE_URL/initialize-database"

echo -e "\n3. Testing authentication page:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$SITE_URL/auth/signin"

echo -e "\n4. Testing middleware-allowed paths:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$SITE_URL/api/ping"

echo -e "\nDone!"