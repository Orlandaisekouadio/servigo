# ServiGo — trouver un artisan de confiance en Côte d’Ivoire

ServiGo est une plateforme web de découverte et de mise en relation entre des particuliers et des artisans, avec un premier périmètre centré sur Abidjan. Les clients peuvent parcourir et filtrer des profils, consulter les avis et enregistrer des favoris. Les artisans disposent d’un espace pour gérer leur profil, leurs zones d’intervention et leur galerie. Une interface d’administration permet de modérer les contenus et de gérer le catalogue. ServiGo facilite le premier contact ; la réservation, la réalisation des travaux et le paiement ne sont pas gérés par l’application.

> **État du projet :** application en développement. Aucun déploiement public, URL de production, pipeline CI ou suite de tests automatisés n’est actuellement configuré dans ce dépôt. Les images téléversées par les artisans sont stockées sur le disque du serveur ; un stockage objet persistant est requis avant une mise en production.

Le rapport de recherche, conception et déploiement proposé pour le projet est dans [`report.md`](./report.md).

## Fonctionnalités disponibles dans le code

- Vitrine responsive présentant les métiers, artisans recommandés, avis et étapes d’utilisation.
- Recherche d’artisans avec pagination et filtres par texte, métier, commune, disponibilité et note.
- Fiches publiques d’artisans avec galerie, zones desservies et avis récents.
- Création de comptes client et artisan, connexion par identifiant/mot de passe ou Google, réinitialisation du mot de passe et gestion de session.
- Espace client : favoris et avis ; espace artisan : profil, zones, galerie et statistiques.
- Back-office protégé par rôle pour gérer les comptes, profils, avis, métiers, communes et journal d’administration.
- Formulaire de contact par courriel, documentation OpenAPI/Swagger en développement et route de santé `/api/health`.

Les données d’exemple de la vitrine et les données MongoDB de démonstration ne constituent pas une validation de marché ni des avis de vrais clients. Le produit n’inclut pas de paiement, de réservation, de devis ni de messagerie entre client et artisan.

## Architecture

```text
Navigateur
  └── React 19 + React Router + Vite + Tailwind CSS 4
        └── API HTTP /api (fetch, cookie de session)
              └── Express 5 + validation Zod + middleware d’accès
                    └── MongoDB via Mongoose 8
                    └── SMTP pour les courriels
                    └── fichiers d’images stockés localement (à remplacer en production)
```

- `client/` — interface React, pages, composants, contexte d’authentification et client API.
- `server/src/routes/` — points d’entrée HTTP et règles d’accès.
- `server/src/controllers/` — traitement métier des requêtes.
- `server/src/models/` — modèles Mongoose et index MongoDB.
- `server/src/validators/` — validation des entrées.
- `server/seed/` — données initiales de démonstration.

L’API est montée sous `/api`. En environnement autre que production, Swagger UI est disponible sur `/api/docs` et la spécification JSON sur `/api/docs.json`. Les variables d’environnement et les secrets ne doivent jamais être ajoutés au dépôt.

## Prérequis

- Node.js et npm.
- MongoDB accessible (instance locale ou cluster géré) pour les fonctionnalités dépendant des données.
- Un serveur SMTP pour les courriels de contact et de réinitialisation de mot de passe.

## Démarrage local

1. Installer les dépendances à la racine :

   ```bash
   npm install
   ```

2. Copier le modèle d’environnement serveur et renseigner au minimum l’URI MongoDB et un secret JWT local :

   ```bash
   cp server/.env.example server/.env
   ```

   Modifier `MONGO_URI` et `JWT_SECRET`. Pour utiliser une base locale, `MONGO_URI` doit pointer vers votre instance MongoDB. Pour les courriels en développement, configurer `SMTP_HOST` et `SMTP_PORT` vers un serveur de test SMTP.

3. Facultatif : si l’API n’écoute pas sur `http://localhost:5000`, créer `client/.env.local` et définir l’URL qui inclut le préfixe `/api` :

   ```dotenv
   VITE_API_URL=http://localhost:5000/api
   ```

4. Dans deux terminaux à la racine du dépôt, démarrer le serveur puis l’interface :

   ```bash
   npm run dev:server
   npm run dev
   ```

   L’interface est servie par Vite (par défaut `http://localhost:5173`) et l’API par Express (par défaut `http://localhost:5000`).

5. Pour charger les données de démonstration dans la base configurée :

   ```bash
   npm run seed
   ```

   N’exécutez cette commande que sur une base de développement prévue à cet effet.

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Démarre Vite pour le client. |
| `npm run dev:server` | Démarre l’API avec rechargement Node.js. |
| `npm run seed` | Charge les données d’exemple dans MongoDB. |
| `npm run build` | Construit le client de production dans `client/dist`. |
| `npm run preview` | Sert localement la construction du client. |
| `npm run lint` | Exécute Oxlint sur le client. |

Il n’existe actuellement ni commande racine de test automatisé, ni lint serveur, ni workflow CI. Le script `build` racine ne construit que le client ; le déploiement du serveur et de la base doit être configuré séparément.

## Configuration serveur

Voir [`server/.env.example`](./server/.env.example) pour la liste des variables. Les valeurs essentielles sont :

| Variable | Rôle |
|---|---|
| `PORT` | Port HTTP du serveur Express. |
| `FRONT_URL` | Origine du client autorisée par CORS et base des liens de réinitialisation. |
| `MONGO_URI` | URI de connexion à MongoDB. |
| `JWT_SECRET` | Secret de signature des sessions ; utiliser une valeur forte et privée. |
| `GOOGLE_CLIENT_ID` | Identifiant client utilisé pour l’authentification Google. |
| `CONTACT_TO` | Adresse qui reçoit les formulaires de contact. |
| `SMTP_HOST`, `SMTP_PORT` | Serveur SMTP utilisé pour l’envoi des courriels. |
| `API_RATE_MAX` | Nombre maximal de requêtes API par adresse IP et fenêtre d’une minute. |

Le client utilise `VITE_API_URL` et, en son absence, appelle `http://localhost:5000/api`. Les variables préfixées `VITE_` sont exposées au navigateur : n’y placer aucun secret.

## Déploiement et prochaines étapes

Le dépôt ne contient pas encore d’infrastructure déclarative ni d’URL publique. Une cible de déploiement adaptée au périmètre est un client statique hébergé sur Vercel, une API Node hébergée sur Render et MongoDB Atlas pour la base. Avant toute ouverture au public, il faut notamment :

1. Déployer client et API sous un domaine contrôlé et configurer `VITE_API_URL`, `FRONT_URL`, CORS, cookies sécurisés et secrets dans les variables du fournisseur.
2. Remplacer le stockage local des téléversements par un stockage objet persistant et tester sa politique d’accès, sa sauvegarde et sa suppression.
3. Configurer SMTP de production, DNS, HTTPS, sauvegardes MongoDB et surveillance de `/api/health`.
4. Ajouter tests ciblés API/client, une intégration continue (lint, tests, build) et un contrôle de déploiement.
5. Réaliser des essais de parcours, d’accessibilité, de charge et de sécurité avec des données représentatives, puis publier l’URL publique dans ce README et dans le rapport.

## Documentation

- [Rapport du projet](./report.md) — contexte, revue de sources, architecture, sécurité, état du déploiement, évaluation et feuille de route.
- [`server/src/config/swagger.js`](./server/src/config/swagger.js) et commentaires des routes — contrats OpenAPI générés en développement.
