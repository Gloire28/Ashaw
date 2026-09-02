# --- Booking Dockerfile ---
FROM node:20-alpine

# bcrypt nécessite une compilation native (python3, make, g++)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (meilleur cache Docker)
COPY package*.json ./

RUN npm ci --omit=dev

# Copier le reste du code
COPY . .

# Générer le client Prisma (optionnel mais recommandé)
RUN npx prisma generate

EXPOSE 5000

# Commande de démarrage (avec migrations automatiques)
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]