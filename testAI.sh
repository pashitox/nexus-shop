#!/bin/bash
# ─────────────────────────────
# NEXUSSHOP - Prueba CORREGIDA con token nuevo
# ─────────────────────────────

echo "🚀 INICIANDO PRUEBA CORREGIDA DEL ASISTENTE IA"
echo "=============================================="

# 1️⃣ OBTENER NUEVO TOKEN - Crear usuario temporal
echo ""
echo "1. 🔐 OBTENIENDO NUEVO TOKEN..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@nexusshop.com",
    "password": "password123"
  }')

echo "🔍 Respuesta login: $LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener token. Intentando registro..."
    
    # Intentar registrar nuevo usuario
    REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:5001/api/auth/register" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test-ia-'$(date +%s)'@nexusshop.com",
        "password": "password123",
        "name": "Test IA"
      }')
    
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
    if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
        echo "❌ ERROR CRÍTICO: No se pudo obtener token. Verifica que el backend esté corriendo."
        echo "💡 Ejecuta: docker compose logs backend"
        exit 1
    fi
fi

echo "✅ Token obtenido: ${TOKEN:0:50}..."

# 2️⃣ VERIFICAR QUE EL BACKEND ESTÉ FUNCIONANDO
echo ""
echo "2. 🔍 VERIFICANDO BACKEND..."
HEALTH_RESPONSE=$(curl -s "http://localhost:5001/api/health")
echo "🏥 Health check: $HEALTH_RESPONSE"

# 3️⃣ PROBAR ENDPOINT DE IA DIRECTAMENTE (sin session)
echo ""
echo "3. 🧪 PROBANDO ENDPOINT IA DIRECTAMENTE..."
AI_DIRECT_RESPONSE=$(curl -s -X POST "http://localhost:5001/api/ai/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Hola, recomiéndame productos",
    "sessionId": "test-session-'$(date +%s)'"
  }')

echo "🤖 Respuesta directa IA:"
echo "$AI_DIRECT_RESPONSE" | jq '.'

# 4️⃣ SI FALLA, PROBAR CREANDO MANUALMENTE LA SESSION
echo ""
echo "4. 🔄 CREANDO SESSION MANUAL..."
# Si el endpoint /start no existe, crear session manual
SESSION_ID="manual-session-$(date +%s)"
echo "✅ Session ID manual: $SESSION_ID"

# 5️⃣ PRUEBA FINAL CON SESSION MANUAL
echo ""
echo "5. 🎯 PRUEBA FINAL CON SESSION MANUAL..."
AI_FINAL_RESPONSE=$(curl -s -X POST "http://localhost:5001/api/ai/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Recomiéndame un smartphone elegante",
    "sessionId": "'$SESSION_ID'"
  }')

echo "📋 Respuesta completa:"
echo "$AI_FINAL_RESPONSE" | jq '.'

# Extraer información específica
echo ""
echo "6. 📊 EXTRACCIÓN DE DATOS:"
if [ "$(echo "$AI_FINAL_RESPONSE" | jq -r '.success')" = "true" ]; then
    echo "✅ ÉXITO - IA respondió correctamente"
    echo "💬 Mensaje: $(echo "$AI_FINAL_RESPONSE" | jq -r '.data.message' | head -100)"
    
    echo "🛍️ Productos recomendados:"
    echo "$AI_FINAL_RESPONSE" | jq -r '.data.recommendedProducts[]? | "  - \(.name) ($\(.price))"' 2>/dev/null || echo "  No hay productos recomendados"
else
    echo "❌ ERROR en la respuesta:"
    echo "$AI_FINAL_RESPONSE" | jq '.'
fi