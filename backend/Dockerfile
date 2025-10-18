FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    openssl \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copiar package.json e instalar dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Crear directorio para logs si es necesario
RUN mkdir -p logs

# Exponer puerto
EXPOSE 5001

# Salud del contenedor
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

# Comando de inicio optimizado
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && npx tsx server.ts"]