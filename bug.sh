#!/bin/bash
set -x  # Modo debug - muestra todos los comandos

echo "🔍 MODO DEBUG - IDENTIFICANDO EL ERROR"

# Verificar permisos
echo "📋 Verificando permisos..."
whoami
docker --version
docker compose version

# Verificar archivos del proyecto
echo "📁 Verificando estructura del proyecto..."
ls -la
ls -la backend/ 2>/dev/null || echo "❌ No hay directorio backend"
ls -la frontend/ 2>/dev/null || echo "❌ No hay directorio frontend"

# Verificar docker-compose.yml
echo "🐳 Verificando docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    cat docker-compose.yml
else
    echo "❌ No existe docker-compose.yml"
    exit 1
fi

# Probar construcción paso a paso
echo "🔨 Probando construcción..."
docker compose down 2>/dev/null || true

echo "📦 Construyendo backend..."
docker compose build backend --no-cache

echo "📦 Construyendo frontend..."
docker compose build frontend --no-cache

echo "🚀 Iniciando servicios..."
docker compose up -d

echo "⏳ Esperando inicio..."
sleep 30

echo "🔍 Verificando contenedores..."
docker compose ps

echo "📊 Mostrando logs..."
docker compose logs --tail=20

echo "✅ Debug completado"