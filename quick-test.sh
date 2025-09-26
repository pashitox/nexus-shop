#!/bin/bash

BASE_URL="http://localhost:5001/api"

echo "🚀 PRUEBA RÁPIDA POST-REPARACIÓN"
echo "================================"

# 1. Productos
echo "📦 Productos:"
curl -s "$BASE_URL/products" | jq '.data.products[0] | {name, price, category}'

# 2. Agregar al carrito
PRODUCT_ID=$(curl -s "$BASE_URL/products" | jq -r '.data.products[0].id')
SESSION="test-$(date +%s)"

echo "🛒 Agregando producto al carrito:"
curl -s -X POST "$BASE_URL/cart/add" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":1,\"sessionId\":\"$SESSION\"}" | jq '.message'

# 3. Ver carrito
echo "📋 Carrito actual:"
curl -s "$BASE_URL/cart?sessionId=$SESSION" | jq '.data.items | length'

echo "✅ Si todo funciona, el sistema está 100% operativo"
