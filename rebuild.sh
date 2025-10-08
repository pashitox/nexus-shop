#!/bin/bash
set -e

echo "🚀 INICIANDO DEPLOYMENT DE NEXUSSHOP..."

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para loggear mensajes
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que Docker esté instalado y funcionando
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker no está corriendo. Inicia Docker primero."
        exit 1
    fi
    
    log_info "Docker verificado correctamente"
}

# Limpiar contenedores anteriores
cleanup() {
    log_info "Limpiando contenedores anteriores..."
    
    # Parar y remover contenedores
    if docker compose ps | grep -q "Up"; then
        log_info "Parando contenedores activos..."
        docker compose down
    fi
    
    # Remover contenedores detenidos
    if [ "$(docker ps -aq)" ]; then
        log_info "Removiendo contenedores..."
        docker rm -f $(docker ps -aq) 2>/dev/null || true
    fi
    
    # Limpiar volúmenes huérfanos
    log_info "Limpiando volúmenes..."
    docker volume prune -f
    
    # Limpiar imágenes sin usar
    log_info "Limpiando imágenes..."
    docker image prune -af
    
    log_info "Limpieza completada"
}

# Reconstruir imágenes
build_images() {
    log_info "Reconstruyendo imágenes Docker..."
    
    # Reconstruir con cache para desarrollo (más rápido)
    docker compose build --no-cache
    
    log_info "Imágenes reconstruidas correctamente"
}

# Iniciar servicios
start_services() {
    log_info "Iniciando servicios..."
    
    # Iniciar en modo detached
    docker compose up -d
    
    log_info "Servicios iniciados"
}

# Verificar que los servicios estén saludables
health_check() {
    log_info "Verificando salud de los servicios..."
    
    # Esperar a que los servicios estén listos
    sleep 15
    
    # Verificar backend
    if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
        log_info "Backend está saludable"
    else
        log_error "Backend no responde"
        docker compose logs backend
        exit 1
    fi
    
    # Verificar frontend (esperar un poco más)
    sleep 10
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "Frontend está saludable"
    else
        log_warn "Frontend aún no responde, puede necesitar más tiempo"
    fi
    
    # Verificar base de datos
    if docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        log_info "Base de datos está saludable"
    else
        log_error "Base de datos no responde"
        docker compose logs db
        exit 1
    fi
}

# Mostrar información final
show_info() {
    echo ""
    log_info "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE"
    echo ""
    echo -e "${GREEN}🌐 URLs de la aplicación:${NC}"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:5001"
    echo "   Database:  localhost:5433"
    echo ""
    echo -e "${YELLOW}📊 Comandos útiles:${NC}"
    echo "   Ver logs:              docker compose logs -f"
    echo "   Ver logs específicos:  docker compose logs [servicio]"
    echo "   Parar servicios:       docker compose down"
    echo "   Reiniciar:             docker compose restart"
    echo ""
}

# Función principal
main() {
    log_info "Iniciando deployment de NexusShop..."
    
    # Paso 1: Verificar Docker
    check_docker
    
    # Paso 2: Limpiar
    cleanup
    
    # Paso 3: Construir
    build_images
    
    # Paso 4: Iniciar
    start_services
    
    # Paso 5: Verificar
    health_check
    
    # Paso 6: Mostrar info
    show_info
    
    log_info "Deployment finalizado exitosamente!"
}

# Manejar señales de interrupción
trap 'log_error "Script interrumpido por el usuario"; exit 1' INT TERM

# Ejecutar función principal
main "$@"