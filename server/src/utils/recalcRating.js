import { Review } from '../models/Review.js';
import { ArtisanProfile } from '../models/ArtisanProfile.js';

// Note publique = moyenne pondérée des chiffres de vitrine (ratingBase/reviewsBase,
// posés par le seed ou l'admin) et des avis réellement écrits (itération 3).
// Utilisé par l'écriture d'avis et la modération (admin, itération 6).
export async function recalcRating(artisanId) {
  const profile = await ArtisanProfile.findById(artisanId).select('ratingBase reviewsBase');
  if (!profile) return null;

  // Seuls les avis écrits via l'API comptent (author présent) : les avis de
  // démonstration du seed sont déjà inclus dans reviewsBase.
  const [stats] = await Review.aggregate([
    { $match: { artisan: artisanId, author: { $exists: true } } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const baseCount = profile.reviewsBase ?? 0;
  const realCount = stats?.count ?? 0;
  const realSum = (stats?.avg ?? 0) * realCount;
  const total = baseCount + realCount;
  const rating =
    total > 0 ? Math.round(((baseCount * (profile.ratingBase ?? 0) + realSum) / total) * 10) / 10 : 0;

  await ArtisanProfile.updateOne(
    { _id: artisanId },
    { $set: { rating, reviewsCount: total } },
  );
  return { rating, reviewsCount: total };
}
