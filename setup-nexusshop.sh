#!/bin/bash

echo "🔧 NEXUSSHOP - SETUP COMPLETO DE PRUEBA"
echo "======================================"

# Configuración básica
POSTGRES_USER="nexus_user"
POSTGRES_DB="nexus_shop"
BASE_URL="http://localhost:5001/api"
SESSION_GUEST="guest-session-$(date +%s)"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'

echo -e "${YELLOW}1️⃣  Cargando productos de prueba...${GREEN}"

# Insertar 25 productos vía API
for i in {1..25}; do
  NAME="Producto $i"
  SLUG="producto-$i"
  DESC="Descripción del producto $i"
  PRICE=$((RANDOM % 1000 + 50)).99
  STOCK=$((RANDOM % 20 + 1))
  CATEGORY=$((i%3)); case $CATEGORY in 0) CAT='Tecnología';; 1) CAT='Hogar';; 2) CAT='Ropa';; esac

  curl -s -X POST "$BASE_URL/products" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\",\"slug\":\"$SLUG\",\"description\":\"$DESC\",\"price\":$PRICE,\"image\":\"/images/product$i.jpg\",\"stock\":$STOCK,\"category\":\"$CAT\",\"active\":true}" >/dev/null
done

echo -e "${GREEN}✅ Productos cargados con éxito"

echo -e "${YELLOW}2️⃣  Creando usuarios de prueba...${GREEN}"

# Crear usuarios de prueba y obtener tokens
USERS=("testuser1@nexusshop.com" "testuser2@nexusshop.com" "testuser3@nexusshop.com")
PASSWORD="password123"
USER_TOKENS=()

for EMAIL in "${USERS[@]}"; do
  curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Usuario de Prueba\"}" >/dev/null

  TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.data.token')
  USER_TOKENS+=($TOKEN)
done

echo -e "${GREEN}✅ Usuarios de prueba creados"

echo -e "${YELLOW}3️⃣  Preparando carritos guest y de usuario...${GREEN}"

# Obtener IDs de productos
PRODUCT_IDS=$(curl -s "$BASE_URL/products" | jq -r '.data.products | .[].id')

# Carrito guest: 5 productos
i=0
for PROD in $PRODUCT_IDS; do
  curl -s -X POST "$BASE_URL/cart/add" \
    -H "Content-Type: application/json" \
    -d "{\"productId\":\"$PROD\",\"quantity\":1,\"sessionId\":\"$SESSION_GUEST\"}" >/dev/null
  i=$((i+1))
  [ $i -ge 5 ] && break
done

# Carrito primer usuario: 3 productos
USER_SESSION="user-session-1"
i=0
for PROD in $PRODUCT_IDS; do
  curl -s -X POST "$BASE_URL/cart/add" \
    -H "Authorization: Bearer ${USER_TOKENS[0]}" \
    -H "Content-Type: application/json" \
    -d "{\"productId\":\"$PROD\",\"quantity\":1,\"sessionId\":\"$USER_SESSION\"}" >/dev/null
  i=$((i+1))
  [ $i -ge 3 ] && break
done

echo -e "${GREEN}✅ Carritos preparados"

echo -e "${YELLOW}4️⃣  Creando órdenes de prueba...${GREEN}"

# Crear una orden para el primer usuario
FIRST_PRODUCT_ID=$(echo $PRODUCT_IDS | cut -d ' ' -f1)
curl -s -X POST "$BASE_URL/orders" \
  -H "Authorization: Bearer ${USER_TOKENS[0]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"shippingAddress\":{
      \"fullName\":\"Usuario 1\",
      \"street\":\"Calle 123\",
      \"city\":\"Ciudad\",
      \"state\":\"Estado\",
      \"postalCode\":\"12345\",
      \"country\":\"México\"
    },
    \"items\":[{\"productId\":\"$FIRST_PRODUCT_ID\",\"quantity\":2}]
  }" >/dev/null

echo -e "${GREEN}✅ Órdenes de prueba creadas"

echo -e "${YELLOW}5️⃣  Verificando datos cargados...${GREEN}"

PRODUCT_COUNT=$(curl -s "$BASE_URL/products" | jq '.data.products | length')
echo "Productos en API: $PRODUCT_COUNT"

echo "Usuarios registrados: ${USERS[*]}"

GUEST_ITEMS=$(curl -s "$BASE_URL/cart?sessionId=$SESSION_GUEST" | jq '.data.items | length')
echo "Items en carrito guest: $GUEST_ITEMS"

USER_ORDERS=$(curl -s -X GET "$BASE_URL/orders" -H "Authorization: Bearer ${USER_TOKENS[0]}" | jq '.data | length')
echo "Órdenes de prueba creadas para usuario1: $USER_ORDERS"

echo -e "${GREEN}🎉 NEXUSSHOP listo para pruebas completas!"
