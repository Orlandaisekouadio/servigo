// Description et image des métiers insérés en base au premier remplissage.
//
// Données de démonstration du seed, pas une source de vérité : la page
// d'accueil, l'inscription et la recherche lisent la collection Service via
// l'API. Ce fichier ne sert qu'à amorcer `description` et `imageUrl` ; ensuite
// c'est l'admin qui fait vivre le catalogue (GET/POST/PATCH/DELETE
// /api/admin/services).
//
// `heroImage` et `howItWorksImage` ont été déplacés dans client/src/data/images.js
// : ce sont des visuels de page, pas des données de service.
export const categories = [
  {
    id: 1,
    name: 'Plomberie',
    metier: 'Plomberie sanitaire',
    description: 'Réparation et installation rapide',
    image: '/images/plomberie.jpg',
  },
  {
    id: 2,
    name: 'Électricité',
    metier: 'Électricité & Câblage',
    description: 'Mise aux normes et dépannage',
    image: '/images/electricite.jpg',
  },
  {
    id: 3,
    name: 'Menuiserie',
    metier: 'Menuiserie & Bois',
    description: 'Création de meubles sur mesure',
    image: '/images/menuiserie.jpg',
  },
  {
    id: 4,
    name: 'Peinture',
    metier: 'Peinture & Finition',
    description: 'Rénovation intérieure et extérieure',
    image: '/images/peinture.jpg',
  },
  {
    id: 5,
    name: 'Climatisation',
    metier: 'Climatisation & Froid',
    description: 'Entretien et pose de climatiseurs',
    image: '/images/climatisation.jpg',
  },
  {
    id: 6,
    name: 'Maçonnerie',
    metier: 'Maçonnerie & Rénovation',
    description: 'Gros œuvre et finitions',
    image: '/images/maconnerie.jpg',
  },
]

export const heroImage = '/images/plomberie.jpg'

export const howItWorksImage = '/images/maconnerie.jpg'