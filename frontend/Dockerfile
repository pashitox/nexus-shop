FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=development
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# CREAR DIRECTORIOS CON PERMISOS CORRECTOS ANTES DE COPIAR
RUN mkdir -p /app/.next/cache \
    && chown -R nextjs:nodejs /app \
    && chmod -R 755 /app

# COPIAR ARCHIVOS MANTENIENDO PERMISOS
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# ASEGURAR PERMISOS FINALES
RUN chown -R nextjs:nodejs /app/.next \
    && chmod -R 755 /app/.next

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Salud del contenedor
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["npm", "start"]
