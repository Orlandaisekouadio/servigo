import { ArtisanProfile } from '../models/ArtisanProfile.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { Favorite } from '../models/Favorite.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { Zone } from '../models/Zone.js';
import { Review } from '../models/Review.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { slugify } from '../utils/slugify.js';
import { uploadSingle, uploadErrorHandler, uploadUrl, removeUpload } from '../middlewares/upload.js';
import {
  updateArtisanProfileSchema,
  createZoneSchema,
  updateZoneSchema,
  createGalleryItemSchema,
  updateGalleryItemSchema,
  idParams,
  formatZodError,
} from '../validators/workspace.js';

const MAX_ZONES = 10;
const MAX_GALLERY = 30;
const SERVICES_SELECT = 'name slug icon';

// --- Middlewares -------------------------------------------------------

async function uniqueSlug(base) {
  const root = base || 'artisan';
  for (let i = 1; i <= 50; i += 1) {
    const candidate = i === 1 ? root : `${root}-${i}`;
    if (!(await ArtisanProfile.exists({ slug: candidate }))) return candidate;
  }
  return `${root}-${Date.now()}`;
}

async function findServiceBySpecialite(specialite) {
  if (!specialite) return null;
  return Service.findOne({ name: specialite.trim() }).select('_id');
}

// Charge le profil de l'artisan connecté, en le créant au premier appel.
export async function requireOwnProfile(req, res, next) {
  try {
    let profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) {
      const [firstService, fallback] = await Promise.all([
        findServiceBySpecialite(req.user.specialite),
        Service.findOne().sort({ name: 1 }).select('_id'),
      ]);
      profile = await ArtisanProfile.create({
        user: req.user._id,
        slug: await uniqueSlug(slugify(req.user.name)),
        name: req.user.name,
        role: req.user.specialite || '',
        commune: req.user.commune || '',
        phone: req.user.phone || '',
        whatsapp: req.user.phone || '',
        services: [(firstService ?? fallback)?._id].filter(Boolean),
      });
    }
    req.profile = profile;
    next();
  } catch (err) {
    next(err);
  }
}

const artisanOnly = [protect, restrictTo('artisan', 'admin'), requireOwnProfile];

// --- Profil ------------------------------------------------------------

function invalid(res, message, details) {
  return res.status(400).json({ ok: false, message, details });
}

export async function getMyProfile(req, res, next) {
  try {
    const data = await ArtisanProfile.findById(req.profile._id)
      .populate('services', SERVICES_SELECT)
      .lean();
    return res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const parsed = updateArtisanProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const { name, services, ...rest } = parsed.data;
    const update = { ...rest };

    if (services) {
      const found = await Service.find({ slug: { $in: services } }).select('_id');
      if (found.length !== new Set(services).size) {
        return invalid(res, 'Un ou plusieurs services sont inconnus.', [
          { field: 'services', message: 'Catalogue invalide.' },
        ]);
      }
      update.services = found.map((s) => s._id);
    }

    // Le nom vit sur le compte : une seule source, propagée au profil.
    if (name && name !== req.profile.name) {
      await User.updateOne({ _id: req.user._id }, { $set: { name } });
      update.name = name;
    }

    const data = await ArtisanProfile.findByIdAndUpdate(req.profile._id, { $set: update }, {
      new: true,
      runValidators: true,
    })
      .populate('services', SERVICES_SELECT)
      .lean();

    const user = await User.findById(req.user._id).lean();
    return res.json({ ok: true, data, user });
  } catch (err) {
    next(err);
  }
}

// --- Zones -------------------------------------------------------------

export async function listZones(req, res, next) {
  try {
    const data = await Zone.find({ artisan: req.profile._id }).sort({ createdAt: 1 }).lean();
    return res.json({ ok: true, data, total: data.length, max: MAX_ZONES });
  } catch (err) {
    next(err);
  }
}

export async function createZone(req, res, next) {
  try {
    const parsed = createZoneSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const count = await Zone.countDocuments({ artisan: req.profile._id });
    if (count >= MAX_ZONES) {
      return res.status(400).json({ ok: false, message: `Maximum ${MAX_ZONES} zones.` });
    }
    const data = await Zone.create({ artisan: req.profile._id, ...parsed.data });
    return res.status(201).json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

async function findOwnZone(req, res) {
  const parsed = idParams.safeParse(req.params);
  if (!parsed.success) {
    invalid(res, 'Identifiant invalide.');
    return null;
  }
  const zone = await Zone.findOne({ _id: parsed.data.id, artisan: req.profile._id });
  if (!zone) {
    res.status(404).json({ ok: false, message: 'Zone introuvable.' });
    return null;
  }
  return zone;
}

export async function updateZone(req, res, next) {
  try {
    const zone = await findOwnZone(req, res);
    if (!zone) return undefined;
    const parsed = updateZoneSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    Object.assign(zone, parsed.data);
    await zone.save();
    return res.json({ ok: true, data: zone.toObject() });
  } catch (err) {
    next(err);
  }
}

export async function deleteZone(req, res, next) {
  try {
    const zone = await findOwnZone(req, res);
    if (!zone) return undefined;
    await zone.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// --- Galerie -----------------------------------------------------------

export async function listGallery(req, res, next) {
  try {
    const data = await GalleryItem.find({ artisan: req.profile._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, data, total: data.length, max: MAX_GALLERY });
  } catch (err) {
    next(err);
  }
}

export async function createGalleryItem(req, res, next) {
  try {
    const parsed = createGalleryItemSchema.safeParse(req.body);
    if (!parsed.success) {
      if (req.file) removeUpload(uploadUrl(req.profile._id, req.file.filename));
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const count = await GalleryItem.countDocuments({ artisan: req.profile._id });
    if (count >= MAX_GALLERY) {
      if (req.file) removeUpload(uploadUrl(req.profile._id, req.file.filename));
      return res.status(400).json({ ok: false, message: `Maximum ${MAX_GALLERY} photos.` });
    }
    const data = await GalleryItem.create({
      artisan: req.profile._id,
      imageUrl: uploadUrl(req.profile._id, req.file.filename),
      ...parsed.data,
    });
    return res.status(201).json({ ok: true, data });
  } catch (err) {
    if (req.file) removeUpload(uploadUrl(req.profile._id, req.file.filename));
    next(err);
  }
}

async function findOwnGalleryItem(req, res) {
  const parsed = idParams.safeParse(req.params);
  if (!parsed.success) {
    invalid(res, 'Identifiant invalide.');
    return null;
  }
  const item = await GalleryItem.findOne({ _id: parsed.data.id, artisan: req.profile._id });
  if (!item) {
    res.status(404).json({ ok: false, message: 'Photo introuvable.' });
    return null;
  }
  return item;
}

export async function updateGalleryItem(req, res, next) {
  try {
    const item = await findOwnGalleryItem(req, res);
    if (!item) return undefined;
    const parsed = updateGalleryItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const { imageUrl, ...rest } = parsed.data;
    Object.assign(item, rest);
    // Remplacement d'image : l'ancien fichier est supprimé du disque.
    if (imageUrl && imageUrl !== item.imageUrl) {
      removeUpload(item.imageUrl);
      item.imageUrl = imageUrl;
    }
    await item.save();
    return res.json({ ok: true, data: item.toObject() });
  } catch (err) {
    next(err);
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    const item = await findOwnGalleryItem(req, res);
    if (!item) return undefined;
    await item.deleteOne();
    const fileDeleted = removeUpload(item.imageUrl);
    return res.json({ ok: true, fileDeleted });
  } catch (err) {
    next(err);
  }
}

// --- Avatar / couverture ----------------------------------------------

export async function uploadImage(field, req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'Aucun fichier reçu (champ « file »).' });
    }
    const url = uploadUrl(req.profile._id, req.file.filename);
    const previous = req.profile[field];
    await ArtisanProfile.updateOne({ _id: req.profile._id }, { $set: { [field]: url } });
    if (previous) removeUpload(previous);
    return res.json({ ok: true, url, field });
  } catch (err) {
    if (req.file) removeUpload(uploadUrl(req.profile._id, req.file.filename));
    next(err);
  }
}

// --- Statistiques ------------------------------------------------------

// Uniquement du mesurable : pas de vues de profil, pas de devis, pas de
// taux de réponse (aucun tracking, aucun messaging interne).
export async function getMyStats(req, res, next) {
  try {
    const profileId = req.profile._id;
    const [profile, favoritesCount, galleryCount, zonesCount, realReviewsCount, byService, byRating, lastReview] =
      await Promise.all([
        ArtisanProfile.findById(profileId)
          .populate('services', SERVICES_SELECT)
          .select('rating reviewsCount ratingBase reviewsBase createdAt')
          .lean(),
        Favorite.countDocuments({ artisan: profileId }),
        GalleryItem.countDocuments({ artisan: profileId }),
        Zone.countDocuments({ artisan: profileId }),
        Review.countDocuments({ artisan: profileId, author: { $exists: true } }),
        Review.aggregate([
          { $match: { artisan: profileId, author: { $exists: true }, service: { $ne: '' } } },
          { $group: { _id: '$service', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, label: '$_id', count: 1 } },
        ]),
        Review.aggregate([
          { $match: { artisan: profileId, author: { $exists: true } } },
          { $group: { _id: '$rating', count: { $sum: 1 } } },
        ]),
        Review.findOne({ artisan: profileId, author: { $exists: true } })
          .sort({ createdAt: -1 })
          .select('createdAt')
          .lean(),
      ]);

    const ratingDistribution = [1, 2, 3, 4, 5].map((stars) => ({
      stars,
      count: byRating.find((r) => r._id === stars)?.count ?? 0,
    }));

    return res.json({
      ok: true,
      data: {
        rating: profile.rating,
        reviewsCount: profile.reviewsCount,
        realReviewsCount,
        favoritesCount,
        galleryCount,
        zonesCount,
        services: profile.services,
        memberSince: profile.createdAt,
        lastReviewAt: lastReview?.createdAt ?? null,
        reviewsByService: byService,
        ratingDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
}

export { uploadSingle, uploadErrorHandler };
