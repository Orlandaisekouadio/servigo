import mongoose from 'mongoose';

// Communes desservies par la plateforme. Collection gérée par l'admin, comme
// Service : les listes déroulantes de l'inscription, de la recherche et de la
// fiche artisan lisent toutes la même source.
//
// Le nom est la clé métier : ArtisanProfile.commune le stocke en clair et le
// filtre de recherche le compare exactement. Une commune ne peut donc pas être
// renommée une fois qu'un artisan s'y est installé — d'où `locked`, qui retire
// la commune des listes sans toucher aux profils.
const communeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    // Retire du catalogue public sans supprimer le document : les profils qui la
    // référencent restent cohérents. Une commune verrouillée ne peut plus être
    // supprimée, seulement réactivée.
    active: { type: Boolean, default: true, index: true },
    locked: { type: Boolean, default: false },
    // Ordre d'affichage dans les listes déroulantes (le nom reste le tri de
    // repli pour les communes sans rang explicite).
    position: { type: Number, default: 100 },
  },
  { timestamps: true },
);

communeSchema.index({ active: 1, position: 1, name: 1 });

export const Commune =
  mongoose.models.Commune ?? mongoose.model('Commune', communeSchema);