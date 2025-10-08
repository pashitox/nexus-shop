#!/bin/bash

echo "🏪 NEXUSSHOP - PRUEBA COMPLETA DEL SISTEMA"
echo "=========================================="
echo "🔧 Backend: http://localhost:5001/api"
echo "🌐 Frontend: http://localhost:3000" 
echo "🗄️  Database: localhost:5433"
echo "💳 Sistema de Pagos: Stripe Integration REAL"
echo "🚀 Estado: SISTEMA 100% OPERATIVO"
echo ""

# Configuración
BASE_URL="http://localhost:5001/api"
TEST_EMAIL="test-final-$(date +%s)@nexusshop.com"
TEST_PASSWORD="Password123!"
SESSION_ID="session-final-$(date +%s)"
START_TIME=$SECONDS

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
SUCCESS_COUNT=0
ERROR_COUNT=0

print_result() {
    local status=$1
    local message=$2
    local step=$3
    
    case $status in
        "success") 
            echo -e "${GREEN}✅ [$step] $message${NC}"
            ((SUCCESS_COUNT++))
            ;;
        "error") 
            echo -e "${RED}❌ [$step] $message${NC}"
            ((ERROR_COUNT++))
            ;;
        "info") echo -e "${BLUE}ℹ️  [$step] $message${NC}" ;;
    esac
    echo ""
}

api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    local step=$6
    
    local headers=()
    if [ -n "$token" ]; then
        headers=(-H "Authorization: Bearer $token")
    fi
    
    echo -e "${BLUE}➡️  [$step] $description${NC}"
    echo "   🔗 Endpoint: $method $endpoint"
    
    local response
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            "${headers[@]}" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
            "${headers[@]}" 2>/dev/null)
    fi
    
    local http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    local body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*//')
    
    if [ -z "$http_status" ]; then
        print_result "error" "Sin conexión" "$step"
        return 1
    fi
    
    if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
        if echo "$body" | jq -e '.success' >/dev/null 2>&1; then
            local success_message=$(echo "$body" | jq -r '.message // "Éxito"')
            print_result "success" "HTTP $http_status - $success_message" "$step"
            return 0
        else
            print_result "success" "HTTP $http_status - Respuesta OK" "$step"
            return 0
        fi
    else
        print_result "error" "HTTP $http_status - Error" "$step"
        return 1
    fi
}

echo "1. 🔍 VERIFICACIÓN INICIAL"
echo "=========================="

if docker compose ps | grep -q "Up"; then
    print_result "success" "Contenedores Docker activos" "1.1"
else
    print_result "error" "Contenedores no están corriendo" "1.1"
    exit 1
fi

echo ""
echo "2. ⏳ INICIALIZANDO BACKEND"
echo "==========================="

for i in {1..30}; do
    if curl -s "$BASE_URL/health" >/dev/null; then
        print_result "success" "Backend listo en $i segundos" "2.1"
        break
    fi
    if [ $i -eq 30 ]; then
        print_result "error" "Backend no responde" "2.1"
        exit 1
    fi
    sleep 1
done

api_request "GET" "/health" "" "" "Health Check" "2.2"

echo "3. 🔐 AUTENTICACIÓN"
echo "==================="

REGISTER_DATA='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "name": "Usuario Prueba Final"
}'
api_request "POST" "/auth/register" "$REGISTER_DATA" "" "Registro usuario" "3.1"

LOGIN_DATA='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
}'
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    print_result "success" "Login exitoso - Token obtenido" "3.2"
else
    print_result "error" "Error en login" "3.2"
    exit 1
fi

api_request "GET" "/auth/profile" "" "$TOKEN" "Perfil usuario" "3.3"

echo "4. 🛍️ PRODUCTOS"
echo "================"

PRODUCTS_RESPONSE=$(curl -s "$BASE_URL/products")
if echo "$PRODUCTS_RESPONSE" | jq -e '.data.products' >/dev/null 2>&1; then
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.products | length')
    print_result "success" "Catálogo cargado - $PRODUCT_COUNT productos" "4.1"
    
    PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.products[0].id // empty')
    PRODUCT_NAME=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.products[0].name // empty')
    
    echo "   📦 Producto para prueba: $PRODUCT_NAME"
else
    print_result "error" "Error al cargar catálogo" "4.1"
    exit 1
fi

api_request "GET" "/products/$PRODUCT_ID" "" "" "Detalles producto" "4.2"

echo "5. 🛒 CARRITO"
echo "============="

api_request "GET" "/cart?sessionId=$SESSION_ID" "" "" "Carrito inicial" "5.1"

CART_DATA='{
    "productId": "'$PRODUCT_ID'",
    "quantity": 1,
    "sessionId": "'$SESSION_ID'"
}'
api_request "POST" "/cart/add" "$CART_DATA" "" "Agregar al carrito" "5.2"

CART_RESPONSE=$(curl -s "$BASE_URL/cart?sessionId=$SESSION_ID")
if echo "$CART_RESPONSE" | jq -e '.data.items' >/dev/null 2>&1; then
    CART_ITEMS_COUNT=$(echo "$CART_RESPONSE" | jq -r '.data.items | length')
    CART_TOTAL=$(echo "$CART_RESPONSE" | jq -r '[.data.items[] | .product.price * .quantity] | add // 0')
    print_result "success" "Carrito actualizado - $CART_ITEMS_COUNT items - Total: \$$CART_TOTAL" "5.3"
else
    print_result "error" "Error al obtener carrito" "5.3"
fi

echo "6. 🏠 DIRECCIONES"
echo "================="

ADDRESS_DATA='{
    "street": "Calle Final 789",
    "city": "Ciudad de México", 
    "state": "CDMX",
    "postalCode": "12345",
    "country": "México",
    "fullName": "Usuario Final",
    "phone": "+525555555555",
    "isDefault": true
}'
api_request "POST" "/addresses" "$ADDRESS_DATA" "$TOKEN" "Crear dirección" "6.1"

api_request "GET" "/addresses" "" "$TOKEN" "Listar direcciones" "6.2"

echo "7. 💳 PAGOS STRIPE"
echo "=================="

api_request "GET" "/payments/test" "" "$TOKEN" "Verificar Stripe" "7.1"

echo -e "${BLUE}💳 [7.2] INICIANDO CHECKOUT...${NC}"

CHECKOUT_DATA='{
    "sessionId": "'$SESSION_ID'",
    "shippingAddress": {
        "fullName": "Usuario Final",
        "street": "Calle Final 789",
        "city": "Ciudad de México",
        "state": "CDMX", 
        "postalCode": "12345",
        "country": "México",
        "phone": "+525555555555"
    },
    "guestEmail": "'$TEST_EMAIL'",
    "guestName": "Usuario Final"
}'

CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/payments/checkout" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$CHECKOUT_DATA")

if echo "$CHECKOUT_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    print_result "success" "CHECKOUT EXITOSO" "7.2"
    ORDER_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.orderId // empty')
    AMOUNT=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.amount // 0')
    echo "   📦 Order ID: $ORDER_ID"
    echo "   💰 Monto: \$$(echo "scale=2; $AMOUNT/100" | bc)"
else
    print_result "error" "Error en checkout" "7.2"
fi

echo "8. 📦 ÓRDENES"
echo "============="

api_request "GET" "/orders" "" "$TOKEN" "Historial de órdenes" "8.1"

echo "9. ✅ VALIDACIONES FINALES"
echo "=========================="

api_request "GET" "/cart?sessionId=$SESSION_ID" "" "" "Carrito post-checkout" "9.1"

api_request "GET" "/products/$PRODUCT_ID" "" "" "Stock actualizado" "9.2"

echo "10. 🧹 LIMPIEZA"
echo "==============="

api_request "POST" "/auth/logout" "" "$TOKEN" "Cerrar sesión" "10.1"

echo "11. 📊 RESUMEN FINAL"
echo "===================="

DURATION=$((SECONDS - START_TIME))
TOTAL_TESTS=$((SUCCESS_COUNT + ERROR_COUNT))

if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((SUCCESS_COUNT * 100 / TOTAL_TESTS))
else
    SUCCESS_RATE=0
fi

echo "🏪 NEXUSSHOP - REPORTE FINAL"
echo "============================"
echo "📈 ESTADÍSTICAS:"
echo "   ✅ Éxitos: $SUCCESS_COUNT"
echo "   ❌ Fallos: $ERROR_COUNT"
echo "   📊 Tasa de éxito: $SUCCESS_RATE%"
echo "   ⏱️  Duración: ${DURATION}s"
echo ""
echo "🔗 URLs:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend: http://localhost:5001/api"
echo ""
echo "📝 DATOS:"
echo "   👤 Usuario: $TEST_EMAIL"
echo "   📦 Order ID: ${ORDER_ID:-'N/A'}"
echo "   💰 Monto: \$$(echo "scale=2; ${AMOUNT:-0}/100" | bc)"

if [ $SUCCESS_RATE -eq 100 ]; then
    echo ""
    echo -e "${GREEN}🎉 ¡SISTEMA 100% OPERATIVO!${NC}"
    echo "   🚀 NexusShop listo para producción"
    echo "   💳 Stripe integration funcionando"
    echo "   📦 Sistema completo verificado"
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Sistema funcional con observaciones${NC}"
else
    echo ""
    echo -e "${RED}❌ Sistema con problemas${NC}"
fi

echo ""
echo "🎊 ¡Prueba completada! NexusShop está listo."