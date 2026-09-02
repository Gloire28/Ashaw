# Booking — Frontend Client

Boutique publique : navigation produits + chat en direct avec le vendeur. Déployée
séparément de l'app Admin (2 sites Netlify).

## Installation

```bash
npm install
cp .env.example .env
```

Renseigne dans `.env` l'URL de ton backend (`VITE_API_URL`, `VITE_SOCKET_URL`).

## Développement

```bash
npm run dev
```

## Déploiement Netlify

- Build command : `npm run build`
- Publish directory : `dist`
- Variables d'environnement à définir sur Netlify : `VITE_API_URL`, `VITE_SOCKET_URL`
  (l'URL de production de ton backend, en HTTPS).
- Le fichier `public/_redirects` (et `netlify.toml`) gèrent déjà le fallback SPA
  pour React Router.

## Écrans

- `/` — Accueil
- `/boutique` — Grille produits avec filtre par catégorie
- `/produit/:id` — Fiche produit (galerie photos + vidéo, prix/heure, bouton "Discuter")
- Modale de démarrage de discussion (pseudo + âge)
- Fenêtre de chat (historique, envoi texte/photo/vidéo, demande de photos)
- Bouton flottant "Mes discussions" + liste pour rouvrir une discussion active
- Page 404
