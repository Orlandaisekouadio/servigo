import { z } from 'zod';

const boolString = z
  .string()
  .optional()
  .transform((v) =>
    v === 'true' || v === '1' ? true : v === 'false' || v === '0' ? false : undefined,
  );

export const listArtisansQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  service: z.string().trim().max(80).optional().default(''),
  commune: z.string().trim().max(80).optional().default(''),
  minNote: z.coerce.number().min(0).max(5).optional().default(0),
  disponible: boolString,
  sort: z.enum(['rating', 'reviews', 'new']).optional().default('reviews'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export function formatZodError(err) {
  return err.issues.map((i) => ({ field: i.path.join('.') || 'query', message: i.message }));
}

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
