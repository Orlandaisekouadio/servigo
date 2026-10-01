import { Service } from '../models/Service.js';
import { ArtisanProfile } from '../models/ArtisanProfile.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Favorite } from '../models/Favorite.js';
import { AdminAction } from '../models/AdminAction.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { recalcRating } from '../utils/recalcRating.js';
import { audit } from '../utils/audit.js';
import { slugify } from '../utils/slugify.js';
import { generateToken, RESET_TTL_MINUTES } from '../validators/password.js';
import { sendPasswordReset, passwordResetLink } from '../config/mailer.js';
import { escapeRegExp } from '../validators/artisans.js';
import {
  listQuerySchema,
  listArtisansQuerySchema,
  listUsersQuerySchema,
  listReviewsQuerySchema,
  createServiceSchema,
  updateServiceSchema,
  updateArtisanByAdminSchema,
  updateUserByAdminSchema,
  idParams,
  formatZodError,
} from '../validators/admin.js';

function invalid(res, message, details) {
  return res.status(400).json({ ok: false, message, details });
}

function pageResult(data, page, limit, total) {
  return { ok: true, data, page, limit, total };
}

// --- Vue d'ensemble -----------------------------------------------------

export async function getStats(_req, res, next) {
  try {
    const [roles, artisans, verified, services, reviews, favorites, pending, hidden] =
      await Promise.all([
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        ArtisanProfile.countDocuments(),
        ArtisanProfile.countDocuments({ verified: true, hidden: false }),
        Service.countDocuments({ active: true }),
        Review.countDocuments(),
        Favorite.countDocuments(),
        ArtisanProfile.countDocuments({ verified: false, hidden: false }),
        ArtisanProfile.countDocuments({ hidden: true }),
      ]);
    const byRole = { client: 0, artisan: 0, admin: 0, ...Object.fromEntries(roles.map((r) => [r._id, r.count])) };
    return res.json({
      ok: true,
      data: {
        users: { total: byRole.client + byRole.artisan + byRole.admin, ...byRole },
        artisans: {
          total: artisans,
          verified,
          pendingValidation: pending,
          hidden,
        },
        servicesActive: services,
        reviews,
        favorites,
      },
    });
  } catch (err) {
    next(err);
  }
}

// --- Services -----------------------------------------------------------

export async function listServices(_req, res, next) {
  try {
    const data = await Service.find({}).sort({ active: -1, name: 1 }).lean();
    const counts = await ArtisanProfile.aggregate([
      { $unwind: '$services' },
      { $group: { _id: '$services', count: { $sum: 1 } } },
    ]);
    const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    return res.json({
      ok: true,
      data: data.map((s) => ({ ...s, artisansCount: byId[String(s._id)] ?? 0 })),
      total: data.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function createService(req, res, next) {
  try {
    const parsed = createServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    // Un nom sans caractère ASCII utile (accents seuls, symboles) ne produit
    // aucun slug : on refuse plutôt que de créer un document inaccessible.
    const slug = slugify(parsed.data.name);
    if (!slug) {
      return invalid(res, 'Ce nom ne produit aucun slug : ajoutez des lettres ou des chiffres.');
    }
    if (await Service.exists({ slug })) {
      return res.status(409).json({ ok: false, message: 'Un service porte déjà ce nom.' });
    }
    const data = await Service.create({ ...parsed.data, slug, active: true });
    await audit(req, 'service.create', 'service', data._id, { name: data.name, slug });
    return res.status(201).json({ ok: true, data });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, message: 'Un service porte déjà ce slug.' });
    }
    next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    // Le slug est volontairement absent du schéma de mise à jour : des profils
    // artisan le référencent, le renommer les cassait silencieusement.
    if (Object.keys(req.body ?? {}).length === 1 && 'slug' in req.body) {
      return invalid(res, 'Le slug est figé à la création : des profils artisan le référencent.');
    }
    const parsed = updateServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const data = await Service.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
    if (!data) return res.status(404).json({ ok: false, message: 'Service introuvable.' });
    await audit(req, 'service.update', 'service', data._id, parsed.data);
    return res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteService(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ ok: false, message: 'Service introuvable.' });

    const used = await ArtisanProfile.countDocuments({ services: id });
    if (used > 0) {
      return res.status(409).json({
        ok: false,
        message: `Service utilisé par ${used} artisan(s) : désactivez-le au lieu de le supprimer.`,
        details: [{ field: 'active', message: 'Passez active à false.' }],
      });
    }
    await service.deleteOne();
    await audit(req, 'service.delete', 'service', id, { name: service.name, slug: service.slug });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// --- Artisans -----------------------------------------------------------

export async function listArtisans(req, res, next) {
  try {
    const parsed = listArtisansQuerySchema.safeParse(req.query);
    if (!parsed.success) return invalid(res, 'Paramètres invalides.');
    const { q, status, page, limit } = parsed.data;
    const filter = {};
    if (status === 'pending') filter.verified = false;
    if (status === 'verified') filter.verified = true;
    if (status === 'hidden') filter.hidden = true;
    if (q) {
      const rx = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [{ name: rx }, { role: rx }, { location: rx }];
    }
    const [total, data] = await Promise.all([
      ArtisanProfile.countDocuments(filter),
      ArtisanProfile.find(filter)
        .populate('services', 'name slug')
        .populate('user', 'name email phone role')
        .sort({ verified: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return res.json(pageResult(data, page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getArtisan(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    const data = await ArtisanProfile.findById(id)
      .populate('services', 'name slug')
      .populate('user', 'name email phone role')
      .lean();
    if (!data) return res.status(404).json({ ok: false, message: 'Artisan introuvable.' });
    return res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateArtisan(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    const parsed = updateArtisanByAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const { services, ...rest } = parsed.data;
    const update = { ...rest };

    if (services) {
      const wanted = [...new Set(services)];
      const found = await Service.find({ slug: { $in: wanted } }).select('_id');
      if (found.length !== wanted.length) {
        return invalid(res, 'Un ou plusieurs services sont inconnus.');
      }
      update.services = found.map((s) => s._id);
    }

    const data = await ArtisanProfile.findByIdAndUpdate(id, { $set: update }, {
      new: true,
      runValidators: true,
    }).lean();
    if (!data) return res.status(404).json({ ok: false, message: 'Artisan introuvable.' });

    // Le nom a une source unique (User.name) : on le propage dans l'autre sens.
    if ('name' in update && data.user) {
      await User.updateOne({ _id: data.user }, { $set: { name: update.name } });
    }

    // Les chiffres de vitrine changeant, la note publique est recalculée.
    let fresh = null;
    if ('ratingBase' in update || 'reviewsBase' in update) {
      fresh = await recalcRating(id);
    }
    await audit(req, 'artisan.update', 'artisan', id, {
      changes: Object.keys(update),
      verified: data.verified,
      hidden: data.hidden,
    });
    return res.json({ ok: true, data: { ...data, ...(fresh ? { rating: fresh.rating, reviewsCount: fresh.reviewsCount } : {}) } });
  } catch (err) {
    next(err);
  }
}

// --- Avis ---------------------------------------------------------------

export async function listReviews(req, res, next) {
  try {
    const parsed = listReviewsQuerySchema.safeParse(req.query);
    if (!parsed.success) return invalid(res, 'Paramètres invalides.');
    const { q, rating, page, limit } = parsed.data;
    const filter = {};
    if (rating) filter.rating = rating;
    if (q) {
      const rx = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [{ text: rx }, { authorName: rx }];
    }
    const [total, data] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter)
        .populate('artisan', 'slug name')
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return res.json(pageResult(data, page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    const review = await Review.findById(id).lean();
    if (!review) return res.status(404).json({ ok: false, message: 'Avis introuvable.' });
    await Review.deleteOne({ _id: id });
    // La note de l'artisan tient compte de la suppression.
    const fresh = await recalcRating(review.artisan);
    await audit(req, 'review.delete', 'review', id, {
      authorName: review.authorName,
      rating: review.rating,
      artisan: String(review.artisan),
    });
    return res.json({ ok: true, artisan: fresh });
  } catch (err) {
    next(err);
  }
}

// --- Comptes ------------------------------------------------------------

export async function listUsers(req, res, next) {
  try {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) return invalid(res, 'Paramètres invalides.');
    const { q, role, page, limit } = parsed.data;
    const filter = {};
    if (role !== 'all') filter.role = role;
    if (q) {
      const rx = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    const [total, data] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return res.json(pageResult(data, page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ ok: false, message: 'Compte introuvable.' });
    const profile = await ArtisanProfile.findOne({ user: id }).select('slug verified hidden').lean();
    return res.json({ ok: true, data: { ...user, profile: profile ?? null } });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    const parsed = updateUserByAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const { role, email, phone, ...rest } = parsed.data;
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ ok: false, message: 'Compte introuvable.' });

    if (role && role !== target.role) {
      // Anti-lockout : un admin ne peut pas se retirer son propre rôle. Comme
      // l'appelant est lui-même admin, l'interdire couvre aussi le dernier
      // administrateur — le seul moyen de tous les rétrograder est de se
      // rétrograder soi-même.
      if (target._id.equals(req.user._id)) {
        return res.status(400).json({ ok: false, message: 'Vous ne pouvez pas retirer votre propre rôle.' });
      }
    }

    if (email && email !== target.email) {
      const dup = await User.findOne({ email, _id: { $ne: target._id } });
      if (dup) return res.status(409).json({ ok: false, message: 'Cet email est déjà utilisé.' });
    }
    if (phone && phone !== target.phone) {
      const dup = await User.findOne({ phone, _id: { $ne: target._id } });
      if (dup) return res.status(409).json({ ok: false, message: 'Ce numéro est déjà utilisé.' });
    }

    const update = { ...rest };
    if (role) update.role = role;
    if (email) update.email = email;
    if (phone) update.phone = phone;

    const data = await User.findByIdAndUpdate(id, { $set: update }, { new: true });
    // Le nom a une source unique (User.name) : on le propage au profil.
    if ('name' in update) {
      await ArtisanProfile.updateMany({ user: id }, { $set: { name: update.name } });
    }
    await audit(req, 'user.update', 'user', id, {
      changes: Object.keys(update),
      role: data.role,
    });
    return res.json({ ok: true, data: data.toSafeJSON() });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, message: 'Identifiant déjà utilisé.' });
    }
    next(err);
  }
}

// Envoie un lien de réinitialisation au compte concerné.
export async function sendUserReset(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ ok: false, message: 'Compte introuvable.' });
    if (!user.email) {
      return res.status(400).json({ ok: false, message: "Ce compte n'a pas d'email : impossible d'envoyer un lien." });
    }
    await PasswordReset.deleteMany({ user: user._id });
    const { token, tokenHash, expiresAt } = generateToken();
    await PasswordReset.create({ user: user._id, tokenHash, expiresAt });
    try {
      await sendPasswordReset({
        name: user.name,
        email: user.email,
        link: passwordResetLink(token),
        ttlMinutes: RESET_TTL_MINUTES,
      });
    } catch (err) {
      await PasswordReset.deleteMany({ user: user._id });
      console.error('[admin] email de réinitialisation non envoyé :', err.message);
      return res.status(502).json({ ok: false, message: 'Service de messagerie indisponible.' });
    }
    await audit(req, 'user.reset', 'user', id, { email: user.email });
    return res.json({ ok: true, message: `Lien envoyé à ${user.email}.` });
  } catch (err) {
    next(err);
  }
}

// --- Journal ------------------------------------------------------------

export async function listLog(req, res, next) {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) return invalid(res, 'Paramètres invalides.');
    const { q, page, limit } = parsed.data;
    // targetId n'est volontairement pas peuplé : il pointe tantôt vers un profil,
    // tantôt vers un compte ou un avis, et n'a pas de modèle de référence unique.
    const filter = q
      ? { $or: [{ action: new RegExp(escapeRegExp(q), 'i') }, { targetType: new RegExp(escapeRegExp(q), 'i') }] }
      : {};
    const [total, data] = await Promise.all([
      AdminAction.countDocuments(filter),
      AdminAction.find(filter)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return res.json(pageResult(data, page, limit, total));
  } catch (err) {
    next(err);
  }
}
