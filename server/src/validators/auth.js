import { z } from 'zod';
import { isValidCiPhone } from '../models/User.js';

const name = z.string().trim().min(2, 'Indiquez votre nom et prénoms.').max(120);
const password = z.string().min(8, 'Au moins 8 caractères.').max(200);
const commune = z.string().trim().min(2, 'Choisissez votre zone.').max(80);
const email = z.string().trim().toLowerCase().email('Indiquez un email valide.');
const phone = z
  .string()
  .trim()
  .min(1, 'Indiquez votre numéro.')
  .refine(isValidCiPhone, 'Numéro invalide (10 chiffres, commence par 0).');
const role = z.enum(['client', 'artisan']).default('client');

export const registerSchema = z
  .object({
    name,
    password,
    commune,
    role,
    phone,
    email: email.optional(),
    specialite: z.string().trim().max(80).optional().default(''),
  })
  .refine((d) => d.role !== 'artisan' || d.specialite.trim().length > 0, {
    message: 'Indiquez votre métier.',
    path: ['specialite'],
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Indiquez votre email ou téléphone.'),
  password: z.string().min(1, 'Indiquez votre mot de passe.'),
});

export const googleSchema = z.object({
  idToken: z.string().min(1, 'Jeton Google requis.'),
  role: role.optional(),
});

export function formatZodError(err) {
  return err.issues.map((i) => ({ field: i.path.join('.') || 'form', message: i.message }));
}
