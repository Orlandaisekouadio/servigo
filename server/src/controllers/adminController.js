import { Service } from '../models/Service.js';
import { Commune } from '../models/Commune.js';
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
  createCommuneSchema,
  updateCommuneSchema,
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
        ArtisanProfile.countDocuments({ verified: true, hidden: { $ne: true } }),
        // `{ $ne: false }` et non `{ active: true }` : ce second filtre ignore
        // les métiers créés avant l'existence du champ, qui seraient comptés
        // comme désactivés alors qu'ils sont proposés partout ailleurs.
        Service.countDocuments({ active: { $ne: false } }),
        Review.countDocuments(),
        Favorite.countDocuments(),
        // `{ $ne: true }` plutôt que `false` : les fiches créées avant
        // l'existence du champ n'ont ni `verified` ni `hidden`. Un filtre
        // `= false` les compte à tort comme des fiches explicitement en attente,
        // et les laisse passer pour « attestées » dans les autres filtres.
        ArtisanProfile.countDocuments({ verified: { $ne: true }, hidden: { $ne: true } }),
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

// --- Communes -----------------------------------------------------------

export async function listCommunes(_req, res, next) {
  try {
    const data = await Commune.find({}).sort({ active: -1, position: 1, name: 1 }).lean();
    // Une commune désactivée reste habitée par des profils : le dire évite que
    // l'admin la supprime et casse la cohérence des fiches.
    const counts = await ArtisanProfile.aggregate([
      { $match: { commune: { $nin: ['', null] } } },
      { $group: { _id: '$commune', count: { $sum: 1 } } },
    ]);
    const byName = new Map(counts.map((c) => [c._id, c.count]));
    return res.json({
      ok: true,
      data: data.map((c) => ({ ...c, artisansCount: byName.get(c.name) ?? 0 })),
      total: data.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function createCommune(req, res, next) {
  try {
    const parsed = createCommuneSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const existing = await Commune.findOne({ name: parsed.data.name });
    if (existing) {
      return res.status(409).json({ ok: false, message: 'Cette commune existe déjà.' });
    }
    const data = await Commune.create(parsed.data);
    await audit(req, 'commune.create', 'commune', data._id, { name: data.name });
    return res.status(201).json({ ok: true, data });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, message: 'Cette commune existe déjà.' });
    }
    next(err);
  }
}

export async function updateCommune(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    // Renommer une commune国有资产 invalid. Le nom est une clé métier
    // (ArtisanProfile.commune), pas un libellé : on le refuse franchement
    // plutôt que de laisser des profils orphelins.
    if ('name' in (req.body ?? {})) {
      return invalid(
        res,
        'Le nom d’une commune est figé : des profils artisan y sont rattachés. Créez-la, transférez les artisans, puis désactivez-la.',
        [{ field: 'name', message: 'Renommage non autorisé.' }],
      );
    }
    const parsed = updateCommuneSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const data = await Commune.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
    if (!data) return res.status(404).json({ ok: false, message: 'Commune introuvable.' });
    await audit(req, 'commune.update', 'commune', data._id, parsed.data);
    return res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteCommune(req, res, next) {
  try {
    const params = idParams.safeParse(req.params);
    if (!params.success) return invalid(res, 'Identifiant invalide.');
    const { id } = params.data;
    const commune = await Commune.findById(id);
    if (!commune) return res.status(404).json({ ok: false, message: 'Commune introuvable.' });

    const used = await ArtisanProfile.countDocuments({ commune: commune.name });
    if (used > 0) {
      return res.status(409).json({
        ok: false,
        message: `Commune utilisée par ${used} artisan(s) : désactivez-la au lieu de la supprimer.`,
        details: [{ field: 'active', message: 'Passez active à false.' }],
      });
    }
    await commune.deleteOne();
    await audit(req, 'commune.delete', 'commune', id, { name: commune.name });
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
    // Même règle que les compteurs : une fiche sans le champ est traitée comme
    // non attestée et non masquée, sinon le filtre « en attente » ne
    // remonterait que les fiches qui portent explicitement `verified: false`.
    if (status === 'pending') filter.verified = { $ne: true };
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
