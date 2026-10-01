export const METIERS = [
  'Tous les métiers',
  'Plomberie sanitaire',
  'Électricité & Câblage',
  'Menuiserie & Bois',
  'Climatisation & Froid',
  'Peinture & Finition',
  'Maçonnerie & Rénovation',
  'Serrurerie',
]

export const COMMUNES = [
  'Toutes les communes',
  'Cocody',
  'Deux-Plateaux / Vallons',
  'Marcory / Zone 4',
  'Yopougon',
  'Le Plateau',
  'Koumassi',
  'Port-Bouët',
  'Treichville',
  'Bingerville',
]

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, ' ')
    .trim()

export function matchCommune(text) {
  const t = norm(text || '')
  if (!t) return null
  return (
    COMMUNES.slice(1).find((c) => {
      const tokens = norm(c).split(/[/\s]+/).filter(Boolean)
      return tokens.some((tok) => tok.length > 3 && t.includes(tok)) || t.includes(norm(c))
    }) || null
  )
}

export const searchArtisans = [
  {
    id: 1,
    slug: 'mamadou-kone',
    name: 'Mamadou Koné',
    role: 'Plombier Sanitaire & Dépannage',
    avatar: '/images/mamadou.png',
    location: 'Cocody Angré 8e Tranche',
    rating: 4.9,
    reviews: 156,
    available: true,
    availableLabel: 'Disponible',
    metier: 'Plomberie sanitaire',
  },
  {
    id: 2,
    slug: 'koffi-amani',
    name: 'Koffi Amani',
    role: 'Électricien Dépanneur & Bâtiment',
    avatar: '/images/koffi.png',
    location: 'Riviera Bonoumin, Cocody',
    rating: 4.9,
    reviews: 128,
    available: true,
    availableLabel: 'Disponible',
    metier: 'Électricité & Câblage',
  },
  {
    id: 3,
    slug: 'maitre-yao',
    name: 'Maître Yao',
    role: 'Menuisier Ébéniste & Agencement',
    avatar: '/images/yao.png',
    location: 'Deux-Plateaux Vallons, Cocody',
    rating: 5.0,
    reviews: 94,
    available: false,
    availableLabel: 'Bientôt dispo',
    metier: 'Menuiserie & Bois',
  },
  {
    id: 4,
    slug: 'bakary-sangare',
    name: 'Bakary Sangaré',
    role: 'Peintre Décorateur & Enduiseur',
    avatar: '/images/bakary.png',
    location: 'Cocody Danga, Abidjan',
    rating: 4.8,
    reviews: 112,
    available: true,
    availableLabel: 'Disponible',
    metier: 'Peinture & Finition',
  },
  {
    id: 5,
    slug: 'ibrahim-cisse',
    name: 'Ibrahim Cissé',
    role: 'Frigoriste & Spécialiste Climatisation',
    avatar: '/images/ibrahim_cisse.png',
    location: 'Cocody Riviera Golf, Abidjan',
    rating: 4.9,
    reviews: 174,
    available: true,
    availableLabel: 'Disponible',
    metier: 'Climatisation & Froid',
  },
  {
    id: 6,
    slug: 'gerard-ngoran',
    name: "Gérard N'Goran",
    role: 'Maçon Professionnel & Gros Œuvre',
    avatar: '/images/gerard.png',
    location: 'Cocody Palmeraie, Abidjan',
    rating: 4.8,
    reviews: 88,
    available: true,
    availableLabel: 'Disponible',
    metier: 'Maçonnerie & Rénovation',
  },
]

export const koffiProfile = {
  slug: 'koffi-amani',
  name: 'Koffi Amani',
  role: 'Électricien Bâtiment & Industriel',
  avatar: '/images/koffi.png',
  cover: '/images/electricite.jpg',
  location: 'Cocody, Riviera Bonoumin (Abidjan)',
  rating: 4.9,
  available: true,
  services: [
    {
      icon: 'power',
      title: 'Tableaux & Remise aux Normes',
      text: 'Remplacement de fusibles obsolètes, équilibrage des phases, pose de parasurtenseurs contre la foudre et modules de protection tension.',
      tags: ['Triphasé 380V', 'Monophasé 220V', 'Différentiel 30mA'],
    },
    {
      icon: 'crisis_alert',
      title: "Dépannage d'urgence",
      text: 'Court-circuit, disjoncteur général qui saute, odeur de brûlé dans les prises, coupure partielle ou totale alimentation.',
      tags: ['Diagnostic multimètre'],
    },
    {
      icon: 'battery_charging_full',
      title: 'Onduleurs, Inverseurs & Solaire',
      text: 'Câblage inverseurs automatiques de source (CIE / Groupe), stabilisation climatiseurs et bancs de batteries.',
      tags: ['Inverseur automatique', 'Stabilisateurs 5kVA+'],
    },
    {
      icon: 'lightbulb',
      title: 'Éclairage Architectural & LED',
      text: 'Mise en valeur espaces de vie, rubans LED encastrés, spots étanches extérieurs jardins de villas, domotique connectée.',
      tags: ['Spots IP65', 'Variateurs'],
    },
  ],
  gallery: [
    {
      title: 'Riviera Golf, Cocody',
      subtitle: 'Réfection complète tableau 36 modules',
      text: 'Protection différentielle et parafoudre triphasé.',
      photo: '/images/chantiers/chantier-tableau.jpg',
    },
    {
      title: 'Deux-Plateaux Vallons',
      subtitle: 'Éclairage scénographique LED & Spots',
      text: 'Double allumage varié et gorges lumineuses.',
      photo: '/images/chantiers/chantier-led.jpg',
    },
    {
      title: 'Marcory Zone 4',
      subtitle: 'Inverseur automatique CIE / Groupe',
      text: 'Bascule sans coupure pour bureaux et serveurs.',
      photo: '/images/chantiers/chantier-batteries.jpg',
    },
    {
      title: 'Riviera Palmeraie',
      subtitle: 'Câblage neuf duplex 7 pièces',
      text: 'Réseau électrique et data RJ45 Cat 6 blindé.',
      photo: '/images/chantiers/chantier-cablage.jpg',
    },
    {
      title: 'Bingerville Riviera',
      subtitle: 'Éclairage d’ambiance jardin & piscine',
      text: 'Transformateurs 12V TBTS et détecteurs crépusculaires.',
      photo: '/images/chantiers/chantier-jardin.jpg',
    },
    {
      title: 'Le Plateau',
      subtitle: 'Intervention court-circuit boutique',
      text: 'Rétablissement du courant en 35 minutes.',
      photo: '/images/chantiers/chantier-depannage.jpg',
    },
  ],
  reviews: [
    {
      author: 'Amadou D.',
      verified: true,
      location: 'Cocody Riviera 3 • 14 Octobre 2024',
      rating: 5,
      text: 'Coupure totale dimanche soir vers 21h suite à un orage. Koffi arrivé en 30 minutes avec tout le matériel de détection. En moins de 40 minutes, la fuite de courant au niveau du chauffe-eau isolée et sécurisée. Très respectueux, tarif annoncé respecté sans surprise.',
      service: 'Dépannage d’urgence tableau électrique',
    },
    {
      author: 'Marie-Paule K.',
      verified: true,
      location: 'Deux-Plateaux Vallons • 28 Septembre 2024',
      rating: 5,
      text: 'Remplacement complet de notre tableau qui datait de 20 ans. Repérage ligne par ligne très méticuleux. Aucun fil apparent, finitions impeccables et tout le salon nettoyé avant son départ.',
      service: 'Réfection tableau électrique + équilibrage phases',
    },
    {
      author: 'M. Bamba',
      verified: true,
      location: 'Marcory Zone 4 • 12 Septembre 2024',
      rating: 5,
      text: 'Installation d’un inverseur automatique pour alimenter notre agence en cas de délestage CIE. La bascule sur groupe se fait instantanément sans coupure de nos ordinateurs. Excellent travail d’ingénierie et devis clair.',
      service: 'Inverseur automatique triphasé',
    },
  ],
}