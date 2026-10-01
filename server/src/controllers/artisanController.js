import { ArtisanProfile } from '../models/ArtisanProfile.js';
import { Service } from '../models/Service.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { Zone } from '../models/Zone.js';
import { Review } from '../models/Review.js';
import {
  listArtisansQuerySchema,
  formatZodError,
  escapeRegExp,
} from '../validators/artisans.js';

const SORTS = {
  rating: { rating: -1, _id: -1 },
  reviews: { reviewsCount: -1, _id: -1 },
  new: { createdAt: -1, _id: -1 },
};

const SERVICE_POPULATE = { path: 'services', select: 'name slug' };

export async function listArtisans(req, res, next) {
  try {
    const parsed = listArtisansQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        message: 'Paramètres de recherche invalides.',
        details: formatZodError(parsed.error),
      });
    }
    const { q, service, commune, minNote, disponible, sort, page, limit } = parsed.data;
    // Les profils masqués par l'admin sont invisibles de la vitrine.
    const filter = { hidden: { $ne: true } };

    if (service) {
      const svc = await Service.findOne({ slug: service }).select('_id');
      if (!svc) return res.status(400).json({ ok: false, message: `Service inconnu : ${service}.` });
      filter.services = svc._id;
    }
    if (commune) filter.commune = commune;
    if (minNote > 0) filter.rating = { $gte: minNote };
    if (disponible === true) filter.available = true;
    if (disponible === false) filter.available = false;
    if (q) {
      const rx = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [{ name: rx }, { role: rx }, { location: rx }];
    }

    const [total, data] = await Promise.all([
      ArtisanProfile.countDocuments(filter),
      ArtisanProfile.find(filter)
        .populate(SERVICE_POPULATE)
        .sort(SORTS[sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return res.json({ ok: true, data, page, limit, total });
  } catch (err) {
    next(err);
  }
}

export async function getArtisanBySlug(req, res, next) {
  try {
    const profile = await ArtisanProfile.findOne({ slug: req.params.slug, hidden: { $ne: true } })
      .populate(SERVICE_POPULATE)
      .lean();
    if (!profile) return res.status(404).json({ ok: false, message: 'Artisan introuvable.' });
    const [gallery, zones, reviews] = await Promise.all([
      GalleryItem.find({ artisan: profile._id }).sort({ createdAt: 1 }).lean(),
      Zone.find({ artisan: profile._id }).sort({ createdAt: 1 }).lean(),
      Review.find({ artisan: profile._id }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);
    return res.json({ ok: true, data: { ...profile, gallery, zones, reviews } });
  } catch (err) {
    next(err);
  }
}
