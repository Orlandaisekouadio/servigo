// Seed ServiGo — catalogue Services + profils artisans depuis client/src/data/.
// Idempotent : upsert par slug (services, profils), création si absent (users, avis).
// Usage : npm run seed --workspace server [-- --dry-run]
import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const seedDir = new URL('.', import.meta.url).pathname;
const serverDir = path.resolve(seedDir, '..');
const dataDir = path.join(serverDir, '..', 'client', 'src', 'data');

async function load(name) {
  return import(pathToFileURL(path.join(dataDir, name)).href);
}

const { searchArtisans, koffiProfile, METIERS } = await load('search.js');
const { categories } = await load('categories.js');

const dryRun = process.argv.includes('--dry-run') || !process.env.MONGO_URI;

const report = {
  artisansRecherche: searchArtisans.length,
  categories: categories.length,
};

if (dryRun) {
  const { reviews } = await load('reviews.js');
  const { faqItems } = await load('faq.js');
  const { artisans } = await load('artisans.js');
  console.log('[seed] Sources front lues depuis client/src/data/:');
  console.table({
    ...report,
    artisansRecommandes: artisans.length,
    reviews: reviews.length,
    faq: faqItems.length,
  });
  console.log('[seed] dry-run OK — rien écrit (MONGO_URI absent ou --dry-run).');
  process.exit(0);
}

const { Service } = await import('../src/models/Service.js');
const { User } = await import('../src/models/User.js');
const { ArtisanProfile } = await import('../src/models/ArtisanProfile.js');
const { GalleryItem } = await import('../src/models/GalleryItem.js');
const { Zone } = await import('../src/models/Zone.js');
const { Review } = await import('../src/models/Review.js');

const SERVICE_ICONS = {
  'plomberie-sanitaire': 'plumbing',
  'electricite-cablage': 'electrical_services',
  'menuiserie-bois': 'carpenter',
  'peinture-finition': 'format_paint',
  'climatisation-froid': 'ac_unit',
  'maconnerie-renovation': 'construction',
  serrurerie: 'key',
};

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const METIER_TO_SLUG = Object.fromEntries(
  METIERS.filter((m) => m !== 'Tous les métiers').map((m) => [m, slugify(m)]),
);

const COMMUNE_BY_SLUG = {
  'mamadou-kone': 'Cocody',
  'koffi-amani': 'Cocody',
  'maitre-yao': 'Deux-Plateaux / Vallons',
  'bakary-sangare': 'Cocody',
  'ibrahim-cisse': 'Cocody',
  'gerard-ngoran': 'Cocody',
};

const PAYMENT_MEANS = ['Espèces', 'Wave', 'Orange Money'];

await mongoose.connect(process.env.MONGO_URI);

// 1. Services : référentiel METIERS, enrichi par categories (description, image).
const catByMetier = Object.fromEntries(categories.map((c) => [c.metier, c]));
const serviceDocs = METIERS.filter((m) => m !== 'Tous les métiers').map((metier) => {
  const slug = slugify(metier);
  const cat = catByMetier[metier];
  return {
    name: metier,
    slug,
    description: cat?.description ?? '',
    imageUrl: cat?.image ?? '',
    icon: SERVICE_ICONS[slug] ?? 'handyman',
  };
});
for (const s of serviceDocs) {
  await Service.updateOne({ slug: s.slug }, { $set: s }, { upsert: true });
}
const servicesBySlug = Object.fromEntries(
  (await Service.find({}).select('_id slug')).map((s) => [s.slug, s._id]),
);

// 2. Comptes User artisans (téléphones fictifs dédiés au seed).
let usersCreated = 0;
const usersBySlug = {};
for (const [i, a] of searchArtisans.entries()) {
  const phone = `07000000${11 + i}`;
  let user = await User.findOne({ phone });
  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    user = await User.create({
      name: a.name,
      phone,
      passwordHash,
      role: 'artisan',
      commune: COMMUNE_BY_SLUG[a.slug] ?? '',
      specialite: a.metier,
      avatarUrl: a.avatar,
    });
    usersCreated += 1;
  }
  usersBySlug[a.slug] = user;
}

// 3. Profils artisans.
let profilesUpserted = 0;
const profilesBySlug = {};
for (const a of searchArtisans) {
  const svcId = servicesBySlug[METIER_TO_SLUG[a.metier]];
  if (!svcId) throw new Error(`Service non mappé pour métier : ${a.metier}`);
  const isKoffi = a.slug === koffiProfile.slug;
  const doc = {
    slug: a.slug,
    name: a.name,
    role: a.role,
    avatarUrl: a.avatar,
    coverUrl: isKoffi ? koffiProfile.cover : '',
    location: a.location,
    commune: COMMUNE_BY_SLUG[a.slug] ?? '',
    services: [svcId],
    rating: a.rating,
    reviewsCount: a.reviews,
    // Base dénormalisée de la vitrine : les avis réels s'y ajoutent sans effacer
    // les chiffres de démonstration (cf. utils/recalcRating.js).
    ratingBase: a.rating,
    reviewsBase: a.reviews,
    available: a.available,
    availableLabel: a.availableLabel,
    verified: false,
    bio: '',
    phone: usersBySlug[a.slug].phone,
    whatsapp: usersBySlug[a.slug].phone,
    paymentMeans: PAYMENT_MEANS,
    user: usersBySlug[a.slug]._id,
  };
  const profile = await ArtisanProfile.findOneAndUpdate({ slug: a.slug }, { $set: doc }, { upsert: true, new: true });
  profilesBySlug[a.slug] = profile;
  profilesUpserted += 1;
}

// 4. Galerie de Koffi (seules données détaillées du front ; photo -> imageUrl).
// Zones : absentes des données front actuelles — remplies plus tard via dashboard.
const koffi = profilesBySlug[koffiProfile.slug];
await GalleryItem.deleteMany({ artisan: koffi._id });
const galleryItems = Array.isArray(koffiProfile.gallery) ? koffiProfile.gallery : [];
await GalleryItem.insertMany(
  galleryItems.map((g) => ({
    artisan: koffi._id,
    imageUrl: g.photo ?? g.imageUrl ?? '',
    title: g.title,
    subtitle: g.subtitle ?? '',
    text: g.text ?? '',
  })),
);

// 5. Avis Koffi (insertion si aucun — author nullable en seed).
let reviewsInserted = 0;
if ((await Review.countDocuments({ artisan: koffi._id })) === 0) {
  await Review.insertMany(
    koffiProfile.reviews.map((r) => ({
      artisan: koffi._id,
      // pas de clé author : l'index sparse unique ignore les docs sans ce champ
      authorName: r.author,
      rating: r.rating,
      text: r.text,
      service: r.service,
      location: r.location,
      verified: true,
    })),
  );
  reviewsInserted = koffiProfile.reviews.length;
}

console.log('[seed] OK :');
console.table({
  services: serviceDocs.length,
  usersCreated,
  profilesUpserted,
  galerieKoffi: galleryItems.length,
  reviewsInserted,
});
await mongoose.disconnect();
