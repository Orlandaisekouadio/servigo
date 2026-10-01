import { sendContactMessage } from '../config/mailer.js';
import { contactMessageSchema, formatZodError } from '../validators/messages.js';

export async function postMessage(req, res, next) {
  try {
    const parsed = contactMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        message: 'Veuillez corriger les champs.',
        details: formatZodError(parsed.error),
      });
    }

    // Honeypot : on répond comme un succès sans rien envoyer, pour ne pas
    // signaler le piège au robot.
    if (parsed.data.website) {
      return res.status(202).json({ ok: true, message: 'Message envoyé.' });
    }

    const { name, email, subject, message } = parsed.data;
    try {
      await sendContactMessage({ name, email, subject, message });
    } catch (err) {
      console.error('[mail] envoi du formulaire de contact échoué :', err.message);
      return res.status(502).json({
        ok: false,
        message: "Le service de messagerie est indisponible. Réessayez plus tard.",
      });
    }

    return res.status(202).json({ ok: true, message: 'Message envoyé.' });
  } catch (err) {
    next(err);
  }
}
