import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { postMessage } from '../controllers/messageController.js';

const router = Router();

// Anti-spam : 5 envois / 10 min / IP (le limiteur global /api/ est à 120/min).
const messageLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Trop de messages envoyés. Réessayez dans quelques minutes.' },
});

/**
 * @openapi
 * /api/messages:
 *   post:
 *     tags: [Contact]
 *     summary: Envoyer un message depuis le formulaire de contact
 *     description: |
 *       Le message est transmis par email à la boîte ServiGo, il n'est pas
 *       enregistré en base : aucun historique de contacts n'est conservé.
 *       5 envois par IP et par 10 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name: { type: string, minLength: 2 }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               subject: { type: string }
 *               message: { type: string, minLength: 10, maxLength: 2000 }
 *     responses:
 *       202: { description: 'Message accepté et transmis par email' }
 *       400: { $ref: '#/components/responses/400' }
 *       429: { $ref: '#/components/responses/429' }
 */
router.post('/', messageLimiter, postMessage);

export default router;
