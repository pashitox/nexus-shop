FROM node:18-alpine

WORKDIR /app

# Instalar openssl para Prisma
RUN apk add --no-cache openssl

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente y Prisma schema
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Exponer puerto
EXPOSE 5001

# Comando de inicio
CMD ["sh", "-c", "npx prisma generate && npx tsx server.ts"]


