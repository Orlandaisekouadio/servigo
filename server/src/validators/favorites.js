import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

// Cible d'un favori : slug (préféré, lisible) ou id d'ArtisanProfile.
const target = z
  .object({
    artisan: z.string().trim().min(1).optional(),
    artisanId: z
      .string()
      .trim()
      .refine(isValidObjectId, 'Identifiant artisan invalide.')
      .optional(),
  })
  .refine((d) => Boolean(d.artisan || d.artisanId), {
    message: 'Indiquez un artisan.',
    path: ['artisan'],
  });

export const addFavoriteSchema = target;
export const favoriteIdParams = z.object({
  artisanId: z.string().trim().refine(isValidObjectId, 'Identifiant artisan invalide.'),
});

export function formatZodError(err) {
  return err.issues.map((i) => ({ field: i.path.join('.') || 'form', message: i.message }));
}
