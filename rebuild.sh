#!/bin/bash
set -e

echo "🚀 Iniciando deployment de NexusShop..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Funciones de logging
log_info()  { echo -e "${GREEN}✅ $1${NC}"; }
log_warn()  { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Flag de errores
ERRORS=0

# Verificar Docker
check_docker() {
    if ! command -v docker >/dev/null; then
        log_error "Docker no está instalado"
        ERRORS=$((ERRORS+1))
    elif ! docker info >/dev/null; then
        log_error "Docker no está corriendo"
        ERRORS=$((ERRORS+1))
    else
        log_info "Docker verificado"
    fi
}

# Limpiar contenedores, volúmenes e imágenes
cleanup() {
    log_info "Limpiando contenedores anteriores..."
    docker compose down 2>/dev/null || log_warn "No había contenedores activos"
    docker rm -f $(docker ps -aq) 2>/dev/null || log_warn "No se pudieron eliminar algunos contenedores"
    docker volume prune -f || log_warn "No se pudieron limpiar algunos volúmenes"
    docker image prune -af || log_warn "No se pudieron limpiar algunas imágenes"
    log_info "Limpieza completada"
}

# Construir imágenes
build_images() {
    log_info "Reconstruyendo imágenes Docker..."
    docker compose build --no-cache || log_error "Error al reconstruir imágenes"
    log_info "Imágenes reconstruidas"
}

# Iniciar servicios
start_services() {
    log_info "Iniciando servicios..."
    docker compose up -d || log_error "Error al iniciar servicios"
    log_info "Servicios iniciados"
}

# Comprobar salud de servicios
health_check() {
    log_info "Verificando salud de los servicios..."
    sleep 15

    if curl -f http://localhost:5001/api/health >/dev/null 2>&1; then
        log_info "Backend saludable"
    else
        log_warn "Backend no responde"
        docker compose logs backend || true
        ERRORS=$((ERRORS+1))
    fi

    sleep 10
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        log_info "Frontend saludable"
    else
        log_warn "Frontend puede necesitar más tiempo"
        ERRORS=$((ERRORS+1))
    fi

    if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
        log_info "Base de datos saludable"
    else
        log_warn "Base de datos no responde"
        docker compose logs db || true
        ERRORS=$((ERRORS+1))
    fi
}

# Mostrar info final
show_info() {
    log_info "🎉 Deployment completado"
    echo -e "${GREEN}🌐 URLs:${NC}"
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:5001"
    echo "Database: localhost:5433"
    echo -e "${YELLOW}📊 Comandos útiles:${NC}"
    echo "Ver logs: docker compose logs -f"
    echo "Parar:    docker compose down"
    echo "Reiniciar: docker compose restart"

    if [ $ERRORS -gt 0 ]; then
        log_warn "Hubo $ERRORS advertencia(s) o error(es) durante el deploy. Revisa los logs."
    fi
}

# Función principal
main() {
    check_docker
    cleanup
    build_images
    start_services
    health_check
    show_info
}

# Manejar interrupciones
trap 'log_warn "Script interrumpido"; exit 0' INT TERM

# Ejecutar
main "$@"
