FROM node:18-alpine

WORKDIR /app

# Instalar openssl para Prisma
RUN apk add --no-cache openssl

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el código
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Exponer puerto
EXPOSE 5001

# Comando de inicio (seed + server)
CMD ["sh", "-c", "npx prisma generate && npx tsx prisma/seed.ts && npx tsx server.ts"]
