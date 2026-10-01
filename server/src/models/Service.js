import mongoose from 'mongoose';

// Catalogue prédéfini des métiers (menuiserie, électricité, ...) choisis par les artisans.
// Géré par l'admin (CRUD itération 6) ; seed depuis client/src/data/categories.js.
const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    imageUrl: { type: String, default: '' },
    icon: { type: String, default: 'handyman', trim: true, maxlength: 40 },
    // Un service référencé par un profil artisan n'est jamais supprimé : il est
    // désactivé, puis retiré du catalogue public.
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Service =
  mongoose.models.Service ?? mongoose.model('Service', serviceSchema);
