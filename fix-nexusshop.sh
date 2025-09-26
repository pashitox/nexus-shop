#!/bin/bash

echo "🔧 REPARANDO NEXUSSHOP - CARGANDO DATOS DE PRUEBA"
echo "================================================="

# 1. Cargar productos en la base de datos
echo "📦 Cargando productos de prueba..."
docker compose exec postgres psql -U nexus_user -d nexus_shop -c "
INSERT INTO \"Product\" (id, name, slug, description, price, image, stock, category, active, \"createdAt\", \"updatedAt\") VALUES
(gen_random_uuid(), 'Laptop Gaming Pro', 'laptop-gaming-pro', 'Laptop potente para gaming de última generación', 999.99, '/images/laptop.jpg', 10, 'Tecnología', true, now(), now()),
(gen_random_uuid(), 'Smartphone Elite', 'smartphone-elite', 'Teléfono inteligente con cámara profesional', 699.99, '/images/phone.jpg', 15, 'Tecnología', true, now(), now()),
(gen_random_uuid(), 'Auriculares Premium', 'auriculares-premium', 'Sonido de alta calidad con cancelación de ruido', 199.99, '/images/headphones.jpg', 20, 'Audio', true, now(), now()),
(gen_random_uuid(), 'Tablet Pro', 'tablet-pro', 'Tablet para trabajo y entretenimiento', 499.99, '/images/tablet.jpg', 8, 'Tecnología', true, now(), now()),
(gen_random_uuid(), 'Smart Watch', 'smart-watch', 'Reloj inteligente con monitor de salud', 299.99, '/images/watch.jpg', 12, 'Tecnología', true, now(), now()),
(gen_random_uuid(), 'Cámara Profesional', 'camara-profesional', 'Cámara DSLR de alta resolución', 1299.99, '/images/camera.jpg', 5, 'Fotografía', true, now(), now()),
(gen_random_uuid(), 'Monitor 4K', 'monitor-4k', 'Monitor ultra HD 27 pulgadas', 399.99, '/images/monitor.jpg', 7, 'Tecnología', true, now(), now()),
(gen_random_uuid(), 'Teclado Mecánico', 'teclado-mecanico', 'Teclado RGB mecánico', 149.99, '/images/keyboard.jpg', 25, 'Accesorios', true, now(), now()),
(gen_random_uuid(), 'Mouse Gaming', 'mouse-gaming', 'Mouse ergonómico para gaming', 79.99, '/images/mouse.jpg', 30, 'Accesorios', true, now(), now()),
(gen_random_uuid(), 'Auriculares Inalámbricos', 'auriculares-inalambricos', 'Auriculares Bluetooth con cancelación de ruido', 129.99, '/images/headphones-wireless.jpg', 18, 'Audio', true, now(), now())
ON CONFLICT (id) DO NOTHING;
"

# 2. Verificar carga
echo "✅ Verificando productos cargados..."
PRODUCT_COUNT=$(docker compose exec postgres psql -U nexus_user -d nexus_shop -t -c "SELECT COUNT(*) FROM \"Product\";" | tr -d ' ')
echo "   Productos en BD: $PRODUCT_COUNT"

# 3. Probar que el sistema funciona con datos
echo "🧪 Probando sistema con datos reales..."
BASE_URL="http://localhost:5001/api"

# Obtener productos
PRODUCT_API_COUNT=$(curl -s "$BASE_URL/products" | jq '.data.products | length')
echo "   Productos disponibles via API: $PRODUCT_API_COUNT"

# 4. Configuración de Stripe para testing
echo "💳 Configurando Stripe para pruebas..."
cat > backend/.env << 'ENV'
DATABASE_URL="postgresql://nexus_user:nexus_password@postgres:5432/nexus_shop"
JWT_SECRET="tu_jwt_secret_super_seguro_aqui_nexusshop_2024"
NODE_ENV="development"
STRIPE_SECRET_KEY="sk_test_51ABC123...usar clave de prueba real"
STRIPE_WEBHOOK_SECRET="whsec_123...usar webhook secret de prueba"
ENV

# 5. Reiniciar backend con nueva configuración
echo "🔄 Reiniciando backend..."
docker compose restart backend

# Esperar a que esté listo
sleep 10

# 6. Verificación final
echo "🎯 VERIFICACIÓN FINAL:"

# Health check
curl -s "$BASE_URL/health" | jq -r '.message'

# Productos
PRODUCT_API_COUNT=$(curl -s "$BASE_URL/products" | jq '.data.products | length')
echo "✅ Productos en API: $PRODUCT_API_COUNT"

# Test de pagos
curl -s "$BASE_URL/payments/test" | jq '.data.stripeConfigured'

echo ""
echo "🎉 REPARACIÓN COMPLETADA!"
echo "   El sistema ahora debería estar 100% funcional"
