import bcrypt from 'bcryptjs';
import { revocationStamp } from '../middlewares/auth.js';
import { User } from '../models/User.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { sendPasswordReset, passwordResetLink } from '../config/mailer.js';
import {
  forgotPasswordSchema,
  checkResetTokenSchema,
  resetPasswordSchema,
  RESET_TTL_MINUTES,
  generateToken,
  hashToken,
  findUserByIdentifier,
  formatZodError,
} from '../validators/password.js';

const GENERIC_OK = {
  ok: true,
  message: "Si un compte correspond à cet identifiant, un email de réinitialisation vient d'être envoyé.",
};

// Réponse volontairement identique que le compte existe ou non : pas
// d'énumération de comptes.
export async function forgotPassword(req, res, next) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Identifiant invalide.' });
    }
    const user = await User.findOne(findUserByIdentifier(parsed.data.identifier));
    if (user?.email) {
      // Un seul token valide à la fois : les demandes précédentes sont purgées.
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
        console.error('[mail] email de réinitialisation non envoyé :', err.message);
        await PasswordReset.deleteMany({ user: user._id });
      }
    }
    return res.status(200).json(GENERIC_OK);
  } catch (err) {
    next(err);
  }
}

export async function checkResetToken(req, res, next) {
  try {
    const parsed = checkResetTokenSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ ok: false, message: 'Jeton manquant.' });
    const reset = await PasswordReset.findOne({ tokenHash: hashToken(parsed.data.token) });
    if (!reset || reset.expiresAt < new Date()) {
      return res.status(400).json({ ok: false, message: 'Lien invalide ou expiré.' });
    }
    const user = await User.findById(reset.user);
    return res.json({ ok: true, email: user?.email ?? null });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        message: 'Mot de passe invalide.',
        details: formatZodError(parsed.error),
      });
    }
    const reset = await PasswordReset.findOne({ tokenHash: hashToken(parsed.data.token) });
    if (!reset || reset.expiresAt < new Date()) {
      return res.status(400).json({ ok: false, message: 'Lien invalide ou expiré.' });
    }
    const user = await User.findById(reset.user);
    if (!user) return res.status(400).json({ ok: false, message: 'Lien invalide ou expiré.' });

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    // Invalide toutes les sessions déjà émises.
    user.passwordChangedAt = revocationStamp();
    await user.save();
    // Usage unique.
    await PasswordReset.deleteMany({ user: user._id });

    return res.json({ ok: true, message: 'Mot de passe mis à jour. Vous pouvez vous connecter.' });
  } catch (err) {
    next(err);
  }
}
