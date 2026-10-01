import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, default: '', trim: true, maxlength: 120 },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    location: { type: String, default: '', trim: true, maxlength: 160 },
    commune: { type: String, default: '', trim: true, maxlength: 80, index: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', index: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    // Chiffres de vitrine (seed / admin) : la note publique mélange cette base
    // avec les avis réellement écrits via l'API, sinon un premier avis effacerait
    // les 128 avis de démonstration.
    ratingBase: { type: Number, default: 0, min: 0, max: 5 },
    reviewsBase: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true, index: true },
    availableLabel: { type: String, default: 'Disponible', trim: true, maxlength: 60 },
    verified: { type: Boolean, default: false },
    // Masqué par l'admin : retiré de la vitrine, des recherches et de la fiche
    // publique, mais jamais supprimé.
    hidden: { type: Boolean, default: false, index: true },
    bio: { type: String, default: '', trim: true, maxlength: 2000 },
    phone: { type: String, default: '', trim: true, maxlength: 20 },
    whatsapp: { type: String, default: '', trim: true, maxlength: 20 },
    paymentMeans: { type: [String], default: [] },
  },
  { timestamps: true },
);

artisanProfileSchema.index({ rating: -1 });
artisanProfileSchema.index({ user: 1 }, { unique: true, sparse: true });

export const ArtisanProfile =
  mongoose.models.ArtisanProfile ??
  mongoose.model('ArtisanProfile', artisanProfileSchema);
