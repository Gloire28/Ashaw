# Booking — Frontend Admin

Console de gestion pour l'admin solo : conversations, produits, réservations.
Déployée séparément de l'app Client (2 sites Netlify), protégée par un login.

## Installation

```bash
npm install
cp .env.example .env
```

Renseigne `VITE_API_URL` / `VITE_SOCKET_URL` avec l'URL de ton backend.

## Développement

```bash
npm run dev
```

Ouvre sur `http://localhost:5174` (le Client tourne sur 5173 pour éviter tout conflit).

## Déploiement Netlify

- Build command : `npm run build`
- Publish directory : `dist`
- Variables d'environnement : `VITE_API_URL`, `VITE_SOCKET_URL` (backend en HTTPS)
- `public/_redirects` + `netlify.toml` gèrent le fallback SPA.
- Pense à mettre l'URL Netlify de cette app dans `ALLOWED_ORIGINS` côté backend.
- `index.html` a `noindex, nofollow` : la console admin ne doit pas être indexée.

## Écrans

- `/login` — Connexion admin
- `/` — Tableau de bord (produits actifs, conversations actives, en attente, messages du jour)
- `/conversations` — Vue liste + détail : filtre par statut, réponse en direct, envoi photo/vidéo,
  bouton **Créer une réservation** qui pré-remplit pseudo/âge/produit depuis la conversation
- `/produits` — Tableau des produits : ajout/édition (photos + vidéo), activer/désactiver, supprimer
- `/reservations` — Tableau des réservations : filtre statut/date, changement de statut, création
  manuelle, suppression

## Authentification

Le cookie de session admin (`adminToken`) est géré par le backend. Si la session
expire ou n'existe pas, l'app redirige automatiquement vers `/login`.
