import { z } from 'zod';

const hexId = z.string().trim().regex(/^[a-f\d]{24}$/i, 'Identifiant invalide.');

export const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const idParams = z.object({ id: hexId });

// --- Services -----------------------------------------------------------

const serviceFields = {
  name: z.string().trim().min(2, 'Indiquez le nom du métier.').max(80),
  description: z.string().trim().max(300),
  imageUrl: z.string().trim().max(300),
  icon: z.string().trim().max(40),
};

export const createServiceSchema = z.object({
  ...serviceFields,
  // Valeurs par défaut seulement à la création : en PATCH, un champ absent ne
  // doit surtout pas écraser l'existant par une chaîne vide.
  description: serviceFields.description.optional().default(''),
  imageUrl: serviceFields.imageUrl.optional().default(''),
  icon: serviceFields.icon.optional().default('handyman'),
});

// Le slug n'est jamais modifiable : des profils artisan le référencent. Les
// champs non transmis restent inchangés (zod retire les clés absentes).
export const updateServiceSchema = z
  .object({ ...serviceFields, active: z.boolean().optional() })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucune modification envoyée.' });

// --- Artisans -----------------------------------------------------------

export const listArtisansQuerySchema = listQuerySchema.extend({
  status: z.enum(['all', 'pending', 'verified', 'hidden']).optional().default('all'),
});

export const updateArtisanByAdminSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    role: z.string().trim().max(120).optional(),
    location: z.string().trim().max(160).optional(),
    commune: z.string().trim().max(80).optional(),
    bio: z.string().trim().max(2000).optional(),
    phone: z.string().trim().max(20).optional(),
    whatsapp: z.string().trim().max(20).optional(),
    paymentMeans: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
    available: z.boolean().optional(),
    availableLabel: z.string().trim().max(60).optional(),
    avatarUrl: z.string().trim().max(300).optional(),
    coverUrl: z.string().trim().max(300).optional(),
    verified: z.boolean().optional(),
    hidden: z.boolean().optional(),
    ratingBase: z.number().min(0).max(5).optional(),
    reviewsBase: z.number().int().min(0).optional(),
    services: z.array(z.string().trim().min(1)).max(7).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucune modification envoyée.' });

// --- Comptes ------------------------------------------------------------

export const listUsersQuerySchema = listQuerySchema.extend({
  role: z.enum(['all', 'client', 'artisan', 'admin']).optional().default('all'),
});

export const updateUserByAdminSchema = z
  .object({
    role: z.enum(['client', 'artisan', 'admin']).optional(),
    name: z.string().trim().min(2).max(120).optional(),
    commune: z.string().trim().max(80).optional(),
    avatarUrl: z.string().trim().max(300).optional(),
    // Les identifiants gelés à l'itération 5 : seul l'admin y touche.
    email: z.string().trim().toLowerCase().email('Email invalide.').optional(),
    phone: z
      .string()
      .trim()
      .regex(/^0\d{9}$/, 'Numéro invalide (10 chiffres, commence par 0).')
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucune modification envoyée.' });

// --- Avis ---------------------------------------------------------------

export const listReviewsQuerySchema = listQuerySchema.extend({
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export function formatZodError(err) {
  return err.issues.map((i) => ({ field: i.path.join('.') || 'form', message: i.message }));
}
