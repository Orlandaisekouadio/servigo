import crypto from 'node:crypto';
import { z } from 'zod';
import { isValidCiPhone, normalizePhone } from '../models/User.js';

export const RESET_TTL_MINUTES = 60;
const RESET_TTL_MS = RESET_TTL_MINUTES * 60 * 1000;

export function generateToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) };
}

// Seul le hash est stocké en base ; le token en clair n'existe que dans l'email.
export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

const identifier = z
  .string()
  .trim()
  .min(1, 'Indiquez votre email ou téléphone.')
  .refine((v) => v.includes('@') || isValidCiPhone(v), 'Identifiant invalide.');

export const forgotPasswordSchema = z.object({ identifier });

export const checkResetTokenSchema = z.object({
  token: z.string().trim().min(10, 'Jeton manquant.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, 'Jeton manquant.'),
  newPassword: z.string().min(8, 'Au moins 8 caractères.').max(200),
});

export function findUserByIdentifier(value) {
  return value.includes('@')
    ? { email: value.toLowerCase() }
    : { phone: normalizePhone(value) };
}

export function formatZodError(err) {
  return err.issues.map((i) => ({ field: i.path.join('.') || 'form', message: i.message }));
}
