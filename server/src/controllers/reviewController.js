import { Review } from '../models/Review.js';
import { ArtisanProfile } from '../models/ArtisanProfile.js';
import { createReviewSchema, reviewIdParams, formatZodError } from '../validators/reviews.js';
import { recalcRating } from '../utils/recalcRating.js';

async function resolveArtisan({ artisan, artisanId }) {
  if (artisanId) return ArtisanProfile.findById(artisanId);
  return ArtisanProfile.findOne({ slug: artisan });
}

// Réservé aux comptes clients (protect + restrictTo('client') au montage).
export async function createReview(req, res, next) {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ ok: false, message: 'Veuillez corriger les champs.', details: formatZodError(parsed.error) });
    }
    const { artisan, artisanId, rating, text, service, location } = parsed.data;

    const profile = await resolveArtisan(parsed.data);
    if (!profile) return res.status(404).json({ ok: false, message: 'Artisan introuvable.' });
    // Défense en profondeur : même si un artisan passait le restrictTo.
    if (profile.user && profile.user.toString() === req.user._id.toString()) {
      return res.status(403).json({ ok: false, message: 'Vous ne pouvez pas noter votre propre profil.' });
    }

    const already = await Review.findOne({ artisan: profile._id, author: req.user._id });
    if (already) {
      return res.status(409).json({ ok: false, message: 'Vous avez déjà publié un avis pour cet artisan.' });
    }

    const review = await Review.create({
      artisan: profile._id,
      author: req.user._id,
      authorName: req.user.name,
      rating,
      text,
      service,
      location: location || req.user.commune || '',
      verified: true,
    });
    await recalcRating(profile._id);
    const fresh = await ArtisanProfile.findById(profile._id).select('rating reviewsCount').lean();
    return res.status(201).json({ ok: true, data: review, artisan: fresh });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, message: 'Vous avez déjà publié un avis pour cet artisan.' });
    }
    next(err);
  }
}

// Avis récemment publiés, pour la vitrine publique (bandeau « Avis clients » de
// l'accueil). Public par nature : c'est la preuve sociale affichée en page
// d'accueil. Seuls les avis rattachés à un profil visible sont repris, et le nom
// de l'artisan accompagne chaque avis pour que le visiteur puisse le retrouver.
export async function listRecentReviews(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 12);
    const data = await Review.find()
      .populate('artisan', 'slug name role avatarUrl hidden')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    // Le populate peut rapporter un artisan masqué par l'admin : on l'écarte
    // plutôt que de laisser fuiter le nom d'un profil retiré de la vitrine.
    return res.json({
      ok: true,
      data: data.filter((r) => r.artisan && r.artisan.hidden !== true),
      total: data.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function listMyReviews(req, res, next) {
  try {
    const data = await Review.find({ author: req.user._id })
      .populate('artisan', 'slug name role avatarUrl')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, data, total: data.length });
  } catch (err) {
    next(err);
  }
}

export async function deleteMyReview(req, res, next) {
  try {
    const parsed = reviewIdParams.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Identifiant invalide.' });
    }
    const review = await Review.findOne({ _id: parsed.data.id, author: req.user._id });
    if (!review) return res.status(404).json({ ok: false, message: 'Avis introuvable.' });
    const artisanId = review.artisan;
    await review.deleteOne();
    const fresh = await recalcRating(artisanId);
    return res.json({ ok: true, artisan: fresh });
  } catch (err) {
    next(err);
  }
}
