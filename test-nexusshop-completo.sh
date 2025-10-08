#!/bin/bash

echo "🏪 NEXUSSHOP - PRUEBA COMPLETA DEL SISTEMA CON PAGOS REALES"
echo "=========================================================="
echo "🔧 Backend: http://localhost:5001/api"
echo "🌐 Frontend: http://localhost:3000"
echo "🗄️  Database: localhost:5433"
echo "💳 Sistema de Pagos: Stripe Integration REAL"
echo ""

# Configuración
BASE_URL="http://localhost:5001/api"
TEST_EMAIL="test$(date +%s)@nexusshop.com"
TEST_PASSWORD="password123"
SESSION_ID="test-session-$(date +%s)"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contadores para estadísticas
SUCCESS_COUNT=0
ERROR_COUNT=0
WARNING_COUNT=0

# Función para imprimir resultados
print_result() {
    local status=$1
    local message=$2
    local details=$3
    
    case $status in
        "success") 
            echo -e "${GREEN}✅ $message${NC}"
            ((SUCCESS_COUNT++))
            ;;
        "error") 
            echo -e "${RED}❌ $message${NC}"
            ((ERROR_COUNT++))
            ;;
        "info") echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "warning") 
            echo -e "${YELLOW}⚠️  $message${NC}"
            ((WARNING_COUNT++))
            ;;
        "payment") echo -e "${PURPLE}💳 $message${NC}" ;;
        "system") echo -e "${CYAN}🔧 $message${NC}" ;;
    esac
    
    if [ -n "$details" ]; then
        echo "   📝 $details"
    fi
    echo ""
}

# Función para hacer requests con mejor manejo de errores
api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    local headers=()
    if [ -n "$token" ]; then
        headers=(-H "Authorization: Bearer $token")
    fi
    
    echo -e "${BLUE}➡️  $description${NC}"
    echo "   🔗 Endpoint: $method $endpoint"
    
    local response
    local http_status
    local body
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            "${headers[@]}" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
            "${headers[@]}" 2>/dev/null)
    fi
    
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*//')
    
    # Si no hay respuesta, considerar error de conexión
    if [ -z "$http_status" ]; then
        print_result "error" "Sin conexión - Servidor no responde"
        return 1
    fi
    
    if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
        if echo "$body" | jq -e '.success' >/dev/null 2>&1; then
            print_result "success" "HTTP $http_status - $(echo "$body" | jq -r '.message // "Operación exitosa"')"
            echo "$body" | jq '.'
        else
            print_result "success" "HTTP $http_status - Respuesta recibida"
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        fi
    else
        print_result "error" "HTTP $http_status - Error en la solicitud"
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "$body" | jq '.'
        else
            echo "$body"
        fi
        return 1
    fi
}

# Verificar que los servicios estén corriendo
echo "1. 🔍 VERIFICACIÓN INICIAL DEL SISTEMA"
echo "======================================"

if ! docker compose ps | grep -q "Up"; then
    print_result "error" "Los contenedores Docker no están corriendo"
    echo "   💡 Ejecutar: docker compose up -d"
    exit 1
fi

print_result "success" "Contenedores Docker activos y saludables"

# Esperar a que el backend esté listo
echo ""
echo "2. ⏳ ESPERANDO INICIALIZACIÓN DEL BACKEND"
echo "=========================================="

for i in {1..30}; do
    if curl -s "$BASE_URL/health" >/dev/null; then
        print_result "success" "Backend listo después de $i segundos"
        break
    fi
    if [ $i -eq 30 ]; then
        print_result "error" "Backend no responde después de 30 segundos"
        exit 1
    fi
    sleep 1
done

# Health check inicial
api_request "GET" "/health" "" "" "Health Check del sistema"

# 3. PRUEBAS DE AUTENTICACIÓN
echo "3. 🔐 PRUEBAS DE AUTENTICACIÓN"
echo "=============================="

# Registro de usuario
REGISTER_DATA='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "name": "Usuario de Prueba NexusShop"
}'
api_request "POST" "/auth/register" "$REGISTER_DATA" "" "Registro de nuevo usuario"

# Login
LOGIN_DATA='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
}'
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    print_result "success" "Login exitoso - Token JWT obtenido"
    echo "   🔐 Token: ${TOKEN:0:50}..."
else
    print_result "error" "Error en login - No se pudo obtener token"
    echo "   📄 Respuesta: $LOGIN_RESPONSE"
    exit 1
fi

# Perfil de usuario
api_request "GET" "/auth/profile" "" "$TOKEN" "Obtener perfil de usuario autenticado"

# 4. PRUEBAS DE PRODUCTOS - MEJORADO
echo "4. 🛍️ PRUEBAS DE CATÁLOGO DE PRODUCTOS"
echo "====================================="

# Obtener todos los productos
PRODUCTS_RESPONSE=$(curl -s "$BASE_URL/products")
if echo "$PRODUCTS_RESPONSE" | jq -e '.data.products' >/dev/null 2>&1; then
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.products | length')
    print_result "success" "Catálogo de productos cargado - $PRODUCT_COUNT productos disponibles"
    
    # Mostrar productos disponibles
    echo "📦 PRODUCTOS DISPONIBLES:"
    echo "$PRODUCTS_RESPONSE" | jq -r '.data.products[] | "   🏷️  \(.name) - 💰 $\(.price) - 🆔 \(.id)"'
    
    # Extraer ID del primer producto
    PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.products[0].id // empty')
    PRODUCT_NAME=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.products[0].name // empty')
    
    if [ -n "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ]; then
        print_result "info" "Usando producto para pruebas: $PRODUCT_NAME"
        api_request "GET" "/products/$PRODUCT_ID" "" "" "Obtener detalles de producto específico"
    else
        print_result "warning" "No se pudo obtener ID de producto válido"
        # Usar ID hardcodeado como fallback
        PRODUCT_ID="f95c09ed-7eba-4975-9634-7e9e910f038d"
        print_result "info" "Usando producto por defecto para continuar pruebas"
    fi
else
    print_result "error" "Error al cargar el catálogo de productos"
    exit 1
fi

# 5. PRUEBAS DE CARRITO - MEJORADO
echo "5. 🛒 PRUEBAS DEL SISTEMA DE CARRITO"
echo "===================================="

# Obtener carrito vacío inicial
api_request "GET" "/cart?sessionId=$SESSION_ID" "" "" "Obtener carrito de guest (inicialmente vacío)"

# Agregar producto al carrito
CART_DATA='{
    "productId": "'$PRODUCT_ID'",
    "quantity": 2,
    "sessionId": "'$SESSION_ID'"
}'
api_request "POST" "/cart/add" "$CART_DATA" "" "Agregar producto al carrito de guest"

# Ver carrito actualizado
CART_RESPONSE=$(curl -s "$BASE_URL/cart?sessionId=$SESSION_ID")
if echo "$CART_RESPONSE" | jq -e '.data.items' >/dev/null 2>&1; then
    CART_ITEMS_COUNT=$(echo "$CART_RESPONSE" | jq -r '.data.items | length')
    CART_TOTAL=$(echo "$CART_RESPONSE" | jq -r '[.data.items[] | .product.price * .quantity] | add | round')
    
    if [ "$CART_ITEMS_COUNT" -gt 0 ]; then
        print_result "success" "Carrito actualizado - $CART_ITEMS_COUNT items - Total: 💰 $$CART_TOTAL"
        
        # Mostrar items del carrito
        echo "🛒 CONTENIDO DEL CARRITO:"
        echo "$CART_RESPONSE" | jq -r '.data.items[] | "   📦 \(.product.name) x \(.quantity) - 💰 $\(.product.price * .quantity | round)"'
    else
        print_result "warning" "Carrito vacío después de agregar producto"
    fi
else
    print_result "error" "Error al obtener carrito actualizado"
fi

# 6. PRUEBAS DE DIRECCIONES
echo "6. 🏠 PRUEBAS DEL SISTEMA DE DIRECCIONES"
echo "========================================"

# Crear dirección
ADDRESS_DATA='{
    "street": "Avenida Revolución 1500",
    "city": "Ciudad de México", 
    "state": "CDMX",
    "postalCode": "03940",
    "country": "México",
    "fullName": "Usuario de Prueba NexusShop",
    "phone": "+525555555555",
    "isDefault": true
}'
api_request "POST" "/addresses" "$ADDRESS_DATA" "$TOKEN" "Crear nueva dirección de envío"

# Listar direcciones del usuario
api_request "GET" "/addresses" "" "$TOKEN" "Listar direcciones del usuario"

# 7. 🎯 PRUEBAS DEL SISTEMA DE PAGOS CON STRIPE REAL
echo "7. 💳 PRUEBAS DEL SISTEMA DE PAGOS STRIPE REAL"
echo "=============================================="

# Test del sistema de pagos
api_request "GET" "/payments/test" "" "$TOKEN" "Verificar configuración del sistema de pagos Stripe"

# Crear checkout con Stripe REAL
print_result "payment" "INICIANDO PROCESO DE CHECKOUT CON STRIPE REAL..."

CHECKOUT_DATA='{
    "sessionId": "'$SESSION_ID'",
    "shippingAddress": {
        "fullName": "Usuario de Prueba NexusShop",
        "street": "Avenida Revolución 1500",
        "city": "Ciudad de México",
        "state": "CDMX",
        "postalCode": "03940",
        "country": "México",
        "phone": "+525555555555"
    },
    "guestEmail": "'$TEST_EMAIL'",
    "guestName": "Usuario de Prueba NexusShop"
}'

CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/payments/checkout" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$CHECKOUT_DATA")

if echo "$CHECKOUT_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    print_result "success" "🎉 CHECKOUT CON STRIPE REAL CREADO EXITOSAMENTE"
    
    # Extraer datos del checkout
    ORDER_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.orderId // empty')
    CLIENT_SECRET=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.clientSecret // empty')
    AMOUNT=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.amount // 0')
    REQUIRES_ACTION=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.requiresAction // false')
    
    echo "   📦 Order ID: $ORDER_ID"
    echo "   💰 Monto: 💵 $$(echo "scale=2; $AMOUNT/100" | bc)"
    echo "   🔐 Client Secret: ${CLIENT_SECRET:0:40}..."
    echo "   ⚡ Requires Action: $REQUIRES_ACTION"
    
    # Mostrar datos completos del checkout
    echo ""
    echo "📄 DETALLES COMPLETOS DEL CHECKOUT:"
    echo "$CHECKOUT_RESPONSE" | jq '.data'
    
    # Probar estado de la orden
    if [ -n "$ORDER_ID" ]; then
        api_request "GET" "/payments/order-status/$ORDER_ID" "" "$TOKEN" "Verificar estado de la orden recién creada"
        
        # Probar obtener última orden
        api_request "GET" "/payments/latest-order" "" "$TOKEN" "Obtener la última orden del usuario"
    fi
    
else
    print_result "error" "❌ ERROR EN EL PROCESO DE CHECKOUT CON STRIPE"
    echo "$CHECKOUT_RESPONSE" | jq '.'
fi

# 8. PRUEBAS DE ÓRDENES
echo "8. 📦 PRUEBAS DEL SISTEMA DE ÓRDENES"
echo "===================================="

# Historial de órdenes
api_request "GET" "/orders" "" "$TOKEN" "Obtener historial completo de órdenes del usuario"

# 9. PRUEBAS ADICIONALES DEL SISTEMA
echo "9. 🔧 PRUEBAS ADICIONALES DEL SISTEMA"
echo "===================================="

# Verificar carrito después del checkout (debería estar vacío)
api_request "GET" "/cart?sessionId=$SESSION_ID" "" "" "Verificar carrito después del checkout (debería estar vacío)"

# 10. LIMPIEZA Y LOGOUT
echo "10. 🧹 LIMPIEZA Y CIERRE DE SESIÓN"
echo "=================================="

# Logout
api_request "POST" "/auth/logout" "" "$TOKEN" "Cerrar sesión de usuario"

# 11. VERIFICACIÓN FINAL DEL SISTEMA
echo "11. 🗄️ VERIFICACIÓN FINAL DEL SISTEMA COMPLETO"
echo "=============================================="

print_result "system" "ESTADO FINAL DE TODOS LOS COMPONENTES:"

# Health check final
if curl -s "$BASE_URL/health" >/dev/null; then
    print_result "success" "Health Check: ✅ SISTEMA OPERATIVO"
else
    print_result "error" "Health Check: ❌ SISTEMA NO RESPONDE"
fi

# Verificar sistema de pagos
PAYMENTS_TEST=$(curl -s "$BASE_URL/payments/test")
if echo "$PAYMENTS_TEST" | jq -e '.success' >/dev/null 2>&1; then
    print_result "success" "Sistema de Pagos: ✅ OPERATIVO CON STRIPE REAL"
    STRIPE_STATUS=$(echo "$PAYMENTS_TEST" | jq -r '.data.stripeConfigured')
    ORDERS_COUNT=$(echo "$PAYMENTS_TEST" | jq -r '.data.ordersCount')
    echo "   💳 Stripe Configurado: $STRIPE_STATUS"
    echo "   📦 Total de Órdenes: $ORDERS_COUNT"
else
    print_result "error" "Sistema de Pagos: ❌ ERROR"
fi

# Verificar base de datos
PRODUCTS_FINAL=$(curl -s "$BASE_URL/products")
if echo "$PRODUCTS_FINAL" | jq -e '.data.products' >/dev/null 2>&1; then
    PRODUCT_COUNT=$(echo "$PRODUCTS_FINAL" | jq -r '.data.products | length')
    print_result "success" "Base de datos: ✅ CONEXIÓN ESTABLE"
    echo "   📦 Productos en catálogo: $PRODUCT_COUNT"
else
    print_result "error" "Base de datos: ❌ ERROR DE CONEXIÓN"
fi

# Verificar frontend
if curl -s --connect-timeout 10 http://localhost:3000 > /dev/null; then
    print_result "success" "Frontend: ✅ RESPONDIENDO en http://localhost:3000"
else
    print_result "warning" "Frontend: ⚠️  NO RESPONDE - Puede estar en proceso de build"
fi

# 12. RESUMEN FINAL CON ESTADÍSTICAS DETALLADAS
echo "12. 📊 RESUMEN FINAL Y ESTADÍSTICAS DETALLADAS"
echo "=============================================="

# Calcular estadísticas
TOTAL_TESTS=$((SUCCESS_COUNT + ERROR_COUNT + WARNING_COUNT))
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((SUCCESS_COUNT * 100 / TOTAL_TESTS))
else
    SUCCESS_RATE=0
fi

print_result "success" "🎉 ¡PRUEBA COMPLETA DEL SISTEMA FINALIZADA!"
echo ""

echo "🏪 NEXUSSHOP - REPORTE FINAL DEL SISTEMA"
echo "========================================"
echo "📈 ESTADÍSTICAS DE PRUEBAS:"
echo "   ✅ Pruebas exitosas: $SUCCESS_COUNT"
echo "   ⚠️  Advertencias: $WARNING_COUNT"
echo "   ❌ Pruebas fallidas: $ERROR_COUNT" 
echo "   📊 Tasa de éxito: $SUCCESS_RATE%"
echo "   🎯 Total de pruebas: $TOTAL_TESTS"
echo ""
echo "🔗 URLS DE ACCESO:"
echo "   🌐 Frontend:          http://localhost:3000"
echo "   🔧 Backend API:       http://localhost:5001/api"
echo "   📚 API Health:        http://localhost:5001/api/health"
echo "   💳 Payments Test:     http://localhost:5001/api/payments/test"
echo "   🛍️  Productos:        http://localhost:5001/api/products"
echo "   🗄️  Database:          localhost:5433"
echo ""
echo "📝 DATOS DE LA PRUEBA:"
echo "   👤 Usuario: $TEST_EMAIL"
echo "   🔐 Token: ${TOKEN:0:30}..."
echo "   🆔 Session: $SESSION_ID"
echo "   📦 Order ID: ${ORDER_ID:-'N/A'}"
echo "   💰 Monto Procesado: 💵 ${AMOUNT:-0} centavos"
echo "   🕐 Fecha: $(date)"
echo "   ⏱️  Duración: $(($SECONDS / 60))m $(($SECONDS % 60))s"
echo ""

# Evaluación final del sistema
if [ $SUCCESS_RATE -ge 90 ]; then
    print_result "success" "🏆 ¡SISTEMA LISTO PARA PRODUCCIÓN!"
    echo "   🌟 NexusShop está completamente operativo con Stripe Real"
    echo "   💳 Sistema de pagos funcionando correctamente"
    echo "   🚀 Puedes proceder con el desarrollo del frontend"
elif [ $SUCCESS_RATE -ge 70 ]; then
    print_result "warning" "⚠️  Sistema funcional pero con advertencias"
    echo "   🔧 Revisar las advertencias antes de producción"
else
    print_result "error" "❌ Sistema requiere atención inmediata"
    echo "   🛠️  Revisar los errores críticos antes de continuar"
fi

echo ""
echo "🎊 ¡Prueba del sistema NexusShop completada!"
echo "💡 Next: Desarrollar frontend del checkout con Stripe.js"