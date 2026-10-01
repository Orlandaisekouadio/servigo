import { Favorite } from '../models/Favorite.js';
import { ArtisanProfile } from '../models/ArtisanProfile.js';
import { addFavoriteSchema, favoriteIdParams, formatZodError } from '../validators/favorites.js';

const ARTISAN_FIELDS = 'slug name role avatarUrl location commune rating reviewsCount available';

function invalid(res, message, details) {
  return res.status(400).json({ ok: false, message, details });
}

export async function listFavorites(req, res, next) {
  try {
    const data = await Favorite.find({ user: req.user._id })
      .populate('artisan', ARTISAN_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, data, total: data.length });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req, res, next) {
  try {
    const parsed = addFavoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Requête invalide.', formatZodError(parsed.error));
    }
    const { artisan: slug, artisanId } = parsed.data;
    const artisan = slug
      ? await ArtisanProfile.findOne({ slug }).select('_id')
      : await ArtisanProfile.findById(artisanId).select('_id');
    if (!artisan) return res.status(404).json({ ok: false, message: 'Artisan introuvable.' });

    // Idempotent : 200 si déjà favori, 201 à la création.
    const existing = await Favorite.findOne({ user: req.user._id, artisan: artisan._id });
    if (existing) {
      return res.status(200).json({ ok: true, alreadyExists: true, data: existing });
    }
    const favorite = await Favorite.create({ user: req.user._id, artisan: artisan._id });
    return res.status(201).json({ ok: true, data: favorite });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(200).json({ ok: true, alreadyExists: true });
    }
    next(err);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    const parsed = favoriteIdParams.safeParse(req.params);
    if (!parsed.success) {
      return invalid(res, 'Identifiant invalide.', formatZodError(parsed.error));
    }
    const { deletedCount } = await Favorite.deleteOne({
      user: req.user._id,
      artisan: parsed.data.artisanId,
    });
    if (!deletedCount) return res.status(404).json({ ok: false, message: 'Favori introuvable.' });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
