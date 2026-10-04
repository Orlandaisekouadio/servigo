// Suppression des comptes créés pendant les tests manuels de l'authentification
// et de l'espace artisan. Ces comptes sont réels côté base : ils apparaissent dans
// la recherche publique et fausseraient les premiers résultats.
//
// Usage : lancer `node scripts/purge-test-accounts.js`.
// Le script ne supprime que les numéros listés ci-dessous, jamais un compte dont
// le nom ressemble à un homonyme.
import 'dotenv/config';
import mongoose from 'mongoose';

import { ArtisanProfile } from '../src/models/ArtisanProfile.js';
import { Favorite } from '../src/models/Favorite.js';
import { GalleryItem } from '../src/models/GalleryItem.js';
import { Review } from '../src/models/Review.js';
import { User } from '../src/models/User.js';
import { Zone } from '../src/models/Zone.js';

// Numéros utilisés uniquement pour vérifier les parcours de bout en bout.
const TEST_PHONES = [
  '0711223344',
  '0722334455',
  '0733445566',
  '0744556677',
  '0755667788',
  '0766778899',
  '0777889900',
  '0700111122',
  '0700222233',
  // Parcours vérifiés après la mise en production des espaces perso.
  '0788990011',
  '0700999887',
];

await mongoose.connect(process.env.MONGO_URI);

const users = await User.find({ phone: { $in: TEST_PHONES } }).select('_id name phone').lean();
if (users.length === 0) {
  console.log('[purge] Aucun compte de test à supprimer.');
  await mongoose.disconnect();
  process.exit(0);
}

const userIds = users.map((u) => u._id);
const profiles = await ArtisanProfile.find({ user: { $in: userIds } }).select('_id').lean();
const profileIds = profiles.map((p) => p._id);

const removed = {
  galleryItems: profileIds.length ? (await GalleryItem.deleteMany({ artisan: { $in: profileIds } })).deletedCount : 0,
  zones: profileIds.length ? (await Zone.deleteMany({ artisan: { $in: profileIds } })).deletedCount : 0,
  reviews: profileIds.length ? (await Review.deleteMany({ artisan: { $in: profileIds } })).deletedCount : 0,
  favorites: (await Favorite.deleteMany({ $or: [{ user: { $in: userIds } }, { artisan: { $in: profileIds } }] })).deletedCount,
  profiles: await ArtisanProfile.deleteMany({ _id: { $in: profileIds } }).then((r) => r.deletedCount),
  users: await User.deleteMany({ _id: { $in: userIds } }).then((r) => r.deletedCount),
};

console.log('[purge] Comptes supprimés :');
for (const u of users) console.log(`  - ${u.name} (${u.phone})`);
console.log('[purge] Documents liés :', removed);

await mongoose.disconnect();
