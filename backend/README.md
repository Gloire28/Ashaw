# Booking — Backend

Backend Express (ES Modules) + Prisma + Socket.io pour l'application de location/réservation.

## Ce qui a changé par rapport à DiscutShop v1

- Les produits ne sont plus "achetés" avec gestion de stock : ils sont **loués à l'heure**
  (`Product.pricePerHour`).
- Un modèle `Booking` a été ajouté : c'est le "tableau des réservations" de l'admin.
  Une réservation est créée **directement depuis une conversation** (bouton "Créer une
  réservation" côté admin, à construire en Phase 2 frontend) — les infos client (pseudo,
  âge) et produit sont pré-remplies, l'admin ajoute juste date / heure / durée.
  L'admin peut aussi créer une réservation manuelle sans conversation.
- `Product.videoUrl` a été ajouté en plus des photos.
- Stockage média : **Backblaze** (images + vidéos avec la même API).

## Installation

```bash
cd backend
npm install
cp .env.example .env
```

Renseigne dans `.env` :
- `DATABASE_URL` : ta base PostgreSQL
- `JWT_SECRET`, `COOKIE_SECRET` : deux chaînes aléatoires
- `BACKBLAZE_CLOUD_NAME`, `BACKBLAZE_API_KEY`, `BACKBLAZE_API_SECRET` : depuis ton dashboard BACKBLAZE
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` : identifiants du compte admin qui sera créé au seed

## Base de données

```bash
npx prisma generate
npx prisma db push
npm run seed        # crée le compte admin défini dans .env
```

## Lancer le serveur

```bash
npm run dev          # avec nodemon
# ou
npm start
```

Le serveur écoute sur `http://localhost:5000` (ou `PORT` défini dans `.env`).
Health check : `GET /api/health`.

## Endpoints principaux

| Domaine | Route | Accès |
|---|---|---|
| Produits | `GET /api/products` | public — liste des produits actifs |
| Produits | `GET /api/products/:id` | public — fiche produit |
| Produits | `POST /api/products` (multipart: mainPhoto, additionalPhotos[], video) | admin |
| Produits | `PUT /api/products/:id`, `PATCH /:id/toggle`, `DELETE /:id` | admin |
| Conversations | `POST /api/conversations` | public — démarre une discussion (pseudo, age, productId) |
| Conversations | `GET /api/conversations/mine` | public — discussions actives de la session courante |
| Conversations | `GET /api/conversations/:id` | client (propriétaire) ou admin |
| Conversations | `GET /api/conversations/admin/all`, `/admin/stats`, `PATCH /:id/archive` | admin |
| Messages | `GET /api/messages/:conversationId` | client ou admin |
| Messages | `POST /api/messages/:conversationId` (multipart: media) | client ou admin (déterminé par le cookie admin) |
| Messages | `POST /api/messages/:conversationId/photo-request` | client |
| Réservations | `GET /api/bookings`, `POST /api/bookings`, `PATCH /:id`, `DELETE /:id` | admin uniquement |
| Admin | `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me` | — |

## Socket.io

- Le client rejoint la room `join_conversation` avec l'id de sa conversation.
- L'admin rejoint la room globale `join_admin`.
- Événements émis : `new_message`, `new_conversation`, `conversation_updated`.
- Le `sessionId` du handshake est lu depuis le cookie, avec repli sur la query string
  si le cookie n'est pas transmis par le client socket.io.

## Déploiement (Client et Admin sur 2 sites Netlify séparés)

- `ALLOWED_ORIGINS` doit contenir les 2 URLs Netlify (ex: `https://boutique.netlify.app,https://admin-boutique.netlify.app`).
- Il faut `NODE_ENV=production` sur l'hébergeur du backend : les cookies `sessionId` et `adminToken`
  passent alors en `sameSite=none; secure` (obligatoire pour un cookie cross-site) — ce qui implique
  que **le backend doit être servi en HTTPS**.
- En local (`NODE_ENV` non défini), les cookies restent en `sameSite=lax` sans `secure`, donc ça marche
  directement en `http://localhost`.

## Ce qu'il reste à faire

- Phase 2 : frontend React (pages produits, chat, tableau de bord admin, tableau des
  réservations avec le bouton "Créer une réservation" intégré au chat).
- Optionnel : vérification de chevauchement de créneaux dans `bookingService.js`
  si tu veux empêcher deux réservations sur le même produit/horaire.
