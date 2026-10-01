import { z } from 'zod';

const hexId = z.string().trim().regex(/^[a-f\d]{24}$/i, 'Identifiant invalide.');

const phone = z
  .string()
  .trim()
  .regex(/^0\d{9}$/, 'Numéro invalide (10 chiffres, commence par 0).')
  .optional();

// Les services sont référencés par slug : le catalogue fait foi.
const serviceSlugs = z
  .array(z.string().trim().min(1))
  .min(1, 'Choisissez au moins un service.')
  .max(7, 'Maximum 7 services.');

// PATCH /api/artisans/me — chaque champ est optionnel : seule la clé présente
// est appliquée. Aucun champ protégé n'est accepté ici.
export const updateArtisanProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Indiquez votre nom.').max(120).optional(),
    role: z.string().trim().min(2, 'Indiquez votre métier.').max(120).optional(),
    location: z.string().trim().max(160).optional(),
    commune: z.string().trim().max(80).optional(),
    bio: z.string().trim().max(2000).optional(),
    phone,
    whatsapp: phone,
    paymentMeans: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
    available: z.boolean().optional(),
    availableLabel: z.string().trim().min(2).max(60).optional(),
    services: serviceSlugs.optional(),
    avatarUrl: z.string().trim().max(300).optional(),
    coverUrl: z.string().trim().max(300).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Aucune modification envoyée.',
    path: ['body'],
  });

export const createZoneSchema = z.object({
  title: z.string().trim().min(2, 'Indiquez un titre.').max(120),
  text: z.string().trim().max(500).optional().default(''),
  icon: z.string().trim().max(40).optional().default('my_location'),
});

// Le titre est requis (la photo est déjà partie sur le disque à ce stade).
export const createGalleryItemSchema = z.object({
  title: z.string().trim().min(2, 'Indiquez un titre.').max(120),
  subtitle: z.string().trim().max(160).optional().default(''),
  text: z.string().trim().max(500).optional().default(''),
});

export const updateZoneSchema = z.object({
  title: z.string().trim().min(2, 'Indiquez un titre.').max(120).optional(),
  text: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(40).optional(),
});

export const updateGalleryItemSchema = z.object({
  title: z.string().trim().min(2, 'Indiquez un titre.').max(120).optional(),
  subtitle: z.string().trim().max(160).optional(),
  text: z.string().trim().max(500).optional(),
  imageUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v.startsWith('/uploads/'), 'Image invalide.')
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Indiquez votre mot de passe actuel.'),
  newPassword: z.string().min(8, 'Au moins 8 caractères.').max(200),
});

// PATCH /api/auth/me — email et téléphone sont gelés (identifiants de
// connexion) : seul le nom et la commune sont modifiables ici.
export const updateAccountSchema = z
  .object({
    name: z.string().trim().min(2, 'Indiquez votre nom.').max(120).optional(),
    commune: z.string().trim().max(80).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Aucune modification envoyée.',
    path: ['body'],
  });

export const idParams = z.object({ id: hexId });

export function formatZodError(err) {
  return err.issues.map((i) => ({ field: i.path.join('.') || 'form', message: i.message }));
}
