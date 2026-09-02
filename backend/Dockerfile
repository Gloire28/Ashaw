# --- Booking Dockerfile ---
FROM node:20-alpine

# Ajout de openssl et libc6-compat pour Prisma, en plus des outils pour bcrypt
RUN apk add --no-cache python3 make g++ openssl libc6-compat

WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (meilleur cache Docker)
COPY package*.json ./

RUN npm ci --omit=dev

# Copier le reste du code
COPY . .

# Générer le client Prisma
RUN npx prisma generate

EXPOSE 5000

# Commande de démarrage (avec migrations automatiques)
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]