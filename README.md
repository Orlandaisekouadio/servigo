# ServiGo — Artisan Marketplace Landing Page

Landing page **ServiGo** (marché de services artisanaux en Côte d'Ivoire) construite dans le cadre du projet MERN, à partir de la maquette Google Stitch « ServiGo Artisan Marketplace Landing Page ».

Stack : **React + Vite + Tailwind CSS** (frontend statique pour ce premier jet, le backend Express/MongoDB arrivera ensuite).

## Structure

```
servigo-marketplace/
├── package.json          # workspace racine + scripts
└── client/               # frontend React + Vite
    ├── index.html        # fonts + meta
    ├── vite.config.js    # plugin React + Tailwind v4
    └── src/
        ├── App.jsx       # assemblage des sections
        ├── index.css     # tokens Tailwind v4 (@theme) du design system
        ├── data/         # artisans.js, categories.js
        └── components/   # Navbar, Hero, Categories, RecommendedArtisans,
                          # ArtisanCard, HowItWorks, Features, FinalCTA, Footer
```

## Lancer

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # sortie dans client/dist
```

## Sections reproduites (design system « Ivorian Service Pulse »)

- Navbar flottante sticky (logo, nav, CTA « Trouver un artisan »)
- Hero : headline, image avec éléments flottants, barre de recherche, badges de confiance
- Services Populaires : slider horizontal de 6 catégories
- Artisans Recommandés à Abidjan : grille de cartes (profil, notes, dispo, WhatsApp/Appeler)
- Comment ça marche : timeline en 3 étapes
- Features : Artisans Vérifiés, Service Rapide, Qualité Garantie
- CTA final + Footer (newsletter, liens, réseaux sociaux)