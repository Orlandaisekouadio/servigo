import { z } from 'zod';

// Miroir de la validation front (ContactPage.jsx) + borne de longueur sur le
// corps du mail. Aucun modèle : le message transite par Mailpit uniquement.
export const CONTACT_SUBJECTS = [
  "Demande d'information",
  'Devenir artisan partenaire',
  'Partenariat ou presse',
  'Autre',
];

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez votre nom.').max(120),
  email: z.string().trim().toLowerCase().email('Indiquez un email valide.'),
  subject: z.enum(CONTACT_SUBJECTS, {
    errorMap: () => ({ message: 'Choisissez un sujet.' }),
  }),
  message: z
    .string()
    .trim()
    .min(10, 'Votre message doit contenir au moins 10 caractères.')
    .max(4000, 'Message trop long (4000 caractères maximum).'),
  // Piège anti-robot : champ caché, doit rester vide (testé côté contrôleur
  // pour renvoyer un succès silencieux plutôt qu'un 400 qui trahirait le piège).
  website: z.string().max(200).optional(),
});

export function formatZodError(err) {
  return err.issues.map((i) => ({ field: i.path.join('.') || 'form', message: i.message }));
}
