import mongoose from 'mongoose';

// Favoris d'un compte (utilisé côté client ; l'artisan peut aussi en ajouter).
const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

favoriteSchema.index({ user: 1, artisan: 1 }, { unique: true });

export const Favorite =
  mongoose.models.Favorite ?? mongoose.model('Favorite', favoriteSchema);
