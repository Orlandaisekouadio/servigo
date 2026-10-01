// Promeut un compte existant au rôle admin.
// Usage : MONGO_URI=... node scripts/promote-admin.js <email-ou-téléphone>
// (ou charge server/.env depuis la racine server via --env-file).
import 'dotenv/config';
import mongoose from 'mongoose';
import { User, normalizePhone } from '../src/models/User.js';

const identifier = process.argv[2];
if (!identifier) {
  console.error('Usage : node scripts/promote-admin.js <email-ou-téléphone>');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI manquant (server/.env ou variable d’environnement).');
  process.exit(1);
}

const query = identifier.includes('@')
  ? { email: identifier.trim().toLowerCase() }
  : { phone: normalizePhone(identifier) };

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOne(query);
if (!user) {
  console.error('Compte introuvable pour :', identifier);
  await mongoose.disconnect();
  process.exit(1);
}
if (user.role === 'admin') {
  console.log(`Déjà admin : ${user.name} (${user.email ?? user.phone})`);
} else {
  user.role = 'admin';
  await user.save();
  console.log(`Promu admin : ${user.name} (${user.email ?? user.phone})`);
}
await mongoose.disconnect();
