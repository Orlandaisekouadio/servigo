import { z } from 'zod';

export const createReviewSchema = z.object({
  artisan: z.string().trim().min(1, 'Indiquez un artisan.').optional(),
  artisanId: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, 'Identifiant artisan invalide.')
    .optional(),
  rating: z.coerce
    .number({ invalid_type_error: 'Note invalide.' })
    .int('Note invalide.')
    .min(1, 'Note minimale : 1.')
    .max(5, 'Note maximale : 5.'),
  text: z
    .string()
    .trim()
    .min(10, 'Décrivez votre expérience (10 caractères minimum).')
    .max(2000, 'Commentaire trop long (2000 caractères maximum).'),
  service: z.string().trim().max(160).optional().default(''),
  location: z.string().trim().max(160).optional().default(''),
}).refine((d) => Boolean(d.artisan || d.artisanId), {
  message: 'Indiquez un artisan.',
  path: ['artisan'],
});

export const reviewIdParams = z.object({
  id: z.string().trim().regex(/^[a-f\d]{24}$/i, 'Identifiant invalide.'),
});

export function formatZodError(err) {
  return err.issues.map((i) => ({ field: i.path.join('.') || 'form', message: i.message }));
}
