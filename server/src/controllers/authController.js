import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { User, normalizePhone } from '../models/User.js';
import { ArtisanProfile } from '../models/ArtisanProfile.js';
import { registerSchema, loginSchema, googleSchema, formatZodError } from '../validators/auth.js';
import { updateAccountSchema, changePasswordSchema, formatZodError as formatZodErrorWs } from '../validators/workspace.js';
import { signToken, setAuthCookie, clearAuthCookie, revocationStamp } from '../middlewares/auth.js';

const googleClient = new OAuth2Client(env.googleClientId || undefined);

function sendUser(res, status, user) {
  const token = signToken(user);
  setAuthCookie(res, token);
  return res.status(status).json({ ok: true, user: user.toSafeJSON() });
}

function invalid(res, message = 'Requête invalide.', details = undefined) {
  return res.status(400).json({ ok: false, message, details });
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const { name, password, commune, role, specialite, email } = parsed.data;
    const phone = normalizePhone(parsed.data.phone);

    const exists = await User.findOne({
      $or: [email ? { email } : null, { phone }].filter(Boolean),
    });
    if (exists) {
      return res.status(409).json({ ok: false, message: 'Un compte existe déjà avec cet identifiant.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email || undefined,
      phone,
      passwordHash,
      role,
      commune: commune.trim(),
      specialite: role === 'artisan' ? specialite.trim() : '',
    });
    return sendUser(res, 201, user);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, message: 'Un compte existe déjà avec cet identifiant.' });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    const { identifier, password } = parsed.data;
    const isEmail = identifier.includes('@');
    const query = isEmail
      ? { email: identifier.trim().toLowerCase() }
      : { phone: normalizePhone(identifier) };

    const user = await User.findOne(query).select('+passwordHash');
    if (!user?.passwordHash) {
      return res.status(401).json({ ok: false, message: 'Identifiants invalides.' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, message: 'Identifiants invalides.' });
    return sendUser(res, 200, user);
  } catch (err) {
    next(err);
  }
}

export async function google(req, res, next) {
  try {
    const parsed = googleSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Veuillez corriger les champs.', formatZodError(parsed.error));
    }
    if (!env.googleClientId) {
      return res.status(501).json({ ok: false, message: 'Google non configuré (GOOGLE_CLIENT_ID).' });
    }
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: parsed.data.idToken,
        audience: env.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ ok: false, message: 'Jeton Google invalide.' });
    }
    const email = payload?.email?.toLowerCase();
    if (!email) return res.status(401).json({ ok: false, message: 'Jeton Google invalide.' });

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });
    if (!user) {
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        role: parsed.data.role ?? 'client',
        avatarUrl: payload.picture || '',
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      if (!user.avatarUrl && payload.picture) user.avatarUrl = payload.picture;
      await user.save();
    }
    return sendUser(res, 200, user);
  } catch (err) {
    next(err);
  }
}

export function logout(_req, res) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}

export function me(req, res) {
  return res.json({ ok: true, user: req.user.toSafeJSON() });
}

// Email et téléphone sont des identifiants de connexion : ils restent figés
// ici (changement par l'admin). Seuls le nom et la commune sont modifiables.
export async function updateMe(req, res, next) {
  try {
    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Aucune modification valide.', formatZodErrorWs(parsed.error));
    }
    const { name, commune } = parsed.data;
    const update = { commune: commune?.trim() ?? req.user.commune };
    if (name) update.name = name.trim();

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true });
    // Source de vérité du nom : le profil artisan suit le compte.
    if (name) {
      await ArtisanProfile.updateMany({ user: req.user._id }, { $set: { name: update.name } });
    }
    return res.json({ ok: true, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return invalid(res, 'Mot de passe invalide.', formatZodErrorWs(parsed.error));
    }
    const user = await User.findById(req.user._id).select('+passwordHash');
    const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash ?? '');
    if (!ok) {
      return res.status(401).json({ ok: false, message: 'Mot de passe actuel incorrect.' });
    }
    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    // Invalide les sessions déjà émises (autres appareils), puis on réémet un
    // jeton pour l'appareil courant : l'utilisateur n'est pas déconnecté ici.
    user.passwordChangedAt = revocationStamp();
    await user.save();
    setAuthCookie(res, signToken(user));
    return res.json({ ok: true, message: 'Mot de passe mis à jour.' });
  } catch (err) {
    next(err);
  }
}
