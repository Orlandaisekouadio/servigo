import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.js';
import { createReview, listMyReviews, listRecentReviews, deleteMyReview } from '../controllers/reviewController.js';

const router = Router();

// Notation réservée aux comptes clients (les artisans gardent la lecture publique
// des avis via GET /api/artisans/:slug).
/**
 * @openapi
 * /api/reviews:
 *   post:
 *     tags: [Espace client]
 *     summary: Noter un artisan
 *     description: |
 *       Réservé au rôle `client`. Un avis par artisan et par compte client. La
 *       note du profil est recalculée (base vitrine + avis réels).
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [artisanId, rating]
 *             properties:
 *               artisanId: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string, maxLength: 600 }
 *     responses:
 *       201: { description: 'Avis publié' }
 *       400: { $ref: '#/components/responses/400' }
 *       403: { $ref: '#/components/responses/403' }
 *       409: { $ref: '#/components/responses/409' }
 * /api/reviews/me:
 *   get:
 *     tags: [Espace client]
 *     summary: Mes avis
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Avis' }
 *       401: { $ref: '#/components/responses/401' }
 * /api/reviews/{id}:
 *   delete:
 *     tags: [Espace client]
 *     summary: Supprimer mon avis
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Avis supprimé' }
 *       403: { $ref: '#/components/responses/403' }
 *       404: { $ref: '#/components/responses/404' }
 */
/**
 * @openapi
 * /api/reviews/recent:
 *   get:
 *     tags: [Vitrine]
 *     summary: Derniers avis clients publiés (public)
 *     parameters:
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 12 } }
 *     responses:
 *       200: { description: 'Avis récents, du plus récent au plus ancien' }
 */
router.get('/recent', listRecentReviews);
router.post('/', protect, restrictTo('client'), createReview);
router.get('/me', protect, listMyReviews);
router.delete('/:id', protect, deleteMyReview);

export default router;
