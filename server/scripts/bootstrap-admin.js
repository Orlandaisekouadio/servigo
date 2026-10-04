// Crée — ou réinitialise — le compte administrateur à partir de variables
// d'environnement. Aucun mot de passe n'est jamais écrit dans le dépôt.
//
// Usage :
//   ADMIN_EMAIL=admin@servigo.ci ADMIN_PASSWORD='...' npm run bootstrap-admin
//
// Idempotent : relancer avec les mêmes valeurs remet le mot de passe à jour sur
// le compte existant, ce qui permet de le réinitialiser si on l'a perdu. Ne
// touche jamais à un autre compte, même s'il porte déjà le rôle admin.
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? '';
const name = (process.env.ADMIN_NAME ?? 'Administration ServiGo').trim();

if (!email || !password) {
  console.error(
    'Variables manquantes : ADMIN_EMAIL et ADMIN_PASSWORD sont toutes deux requises.\n' +
      'Exemple :\n' +
      "  ADMIN_EMAIL=admin@servigo.ci ADMIN_PASSWORD='un-mot-de-passe-long' npm run bootstrap-admin",
  );
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI manquant (server/.env ou variable d’environnement).');
  process.exit(1);
}

// Même garde-fou que l'inscription : on ne crée pas un compte que personne ne
// pourrait distinguish d'un compte administrateur « normal ».
if (!email.includes('@') || password.length < 8) {
  console.error('Email invalide ou mot de passe trop court (8 caractères minimum).');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const passwordHash = await bcrypt.hash(password, 12);
const existing = await User.findOne({ email }).select('+passwordHash');

if (existing) {
  existing.passwordHash = passwordHash;
  existing.role = 'admin';
  // Un mot de passe neuf invalide les sessions et les liens de réinitialisation
  // antérieurs : le middleware compare `iat` à `passwordChangedAt`, donc sans
  // cette mise à jour un jeton émis avant la rotation resterait valable.
  existing.passwordChangedAt = new Date();
  await existing.save();
  console.log(`Mot de passe admin réinitialisé : ${existing.name} (${email})`);
} else {
  const created = await User.create({
    name,
    email,
    passwordHash,
    role: 'admin',
    passwordChangedAt: new Date(),
  });
  console.log(`Compte admin créé : ${created.name} (${email})`);
}

await mongoose.disconnect();