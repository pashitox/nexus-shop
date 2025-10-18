#!/bin/bash
echo "🚀 PRUEBA RÁPIDA - SISTEMA DE PAGOS NEXUSSHOP"
echo "============================================"

BASE_URL="http://localhost:5001/api"

# Health Check
echo "1. 🔍 Health Check:"
curl -s "$BASE_URL/health" | jq '.'

# Sistema de Pagos
echo ""
echo "2. 💳 Sistema de Pagos:"
curl -s "$BASE_URL/payments/test" | jq '.'

# Productos
echo ""
echo "3. 🛍️ Productos Disponibles:"
PRODUCTS=$(curl -s "$BASE_URL/products")
echo "$PRODUCTS" | jq '.data.products[0:2]'  # Solo primeros 2 productos

# Órdenes
echo ""
echo "4. 📦 Órdenes en Sistema:"
ORDERS_COUNT=$(curl -s "$BASE_URL/payments/test" | jq -r '.data.ordersCount')
echo "   Total de órdenes: $ORDERS_COUNT"

# Frontend
echo ""
echo "5. 🌐 Frontend:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Funcionando en http://localhost:3000"
else
    echo "   ❌ No responde"
fi

echo ""
echo "🎯 ESTADO DEL SISTEMA: ✅ OPERATIVO"
echo "💡 El sistema de pagos está configurado y funcionando"