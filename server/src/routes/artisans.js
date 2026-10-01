import { Router } from 'express';
import { listArtisans, getArtisanBySlug } from '../controllers/artisanController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { requireOwnProfile } from '../controllers/workspaceController.js';
import workspaceRoutes from './workspace.js';

const router = Router();

// Espace artisan : monté AVANT /:slug pour que « /api/artisans/me » ne soit pas
// lu comme un slug de profil public.
router.use(
  '/me',
  protect,
  restrictTo('artisan', 'admin'),
  requireOwnProfile,
  workspaceRoutes,
);

/**
 * @openapi
 * /api/artisans:
 *   get:
 *     tags: [Catalogue]
 *     summary: Rechercher des artisans
 *     description: |
 *       Vitrine publique. Les profils masqués par l'admin (`hidden`) en sont
 *       exclus. Pagination par `page`/`limit` (12 par défaut, 50 au maximum).
 *     parameters:
 *       - { in: query, name: q, schema: { type: string }, description: 'Nom, métier ou zone' }
 *       - { in: query, name: service, schema: { type: string }, description: 'Slug du métier' }
 *       - { in: query, name: commune, schema: { type: string } }
 *       - { in: query, name: minNote, schema: { type: number, minimum: 0, maximum: 5 } }
 *       - { in: query, name: disponible, schema: { type: boolean } }
 *       - { in: query, name: sort, schema: { type: string, enum: [rating, reviews, new], default: reviews } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 50, default: 12 } }
 *     responses:
 *       200:
 *         description: Page de profils
 *         schema:
 *           type: object
 *           properties:
 *             ok: { type: boolean }
 *             data: { type: array, items: { $ref: '#/components/schemas/ArtisanProfile' } }
 *             page: { type: integer }
 *             limit: { type: integer }
 *             total: { type: integer }
 *       400: { $ref: '#/components/responses/400' }
 * /api/artisans/{slug}:
 *   get:
 *     tags: [Catalogue]
 *     summary: Fiche publique d'un artisan
 *     description: 'Inclut galerie, zones couvertes et les 3 derniers avis.'
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Profil', schema: { type: object, properties: { ok: {type: boolean}, data: { $ref: '#/components/schemas/ArtisanProfile' } } } }
 *       404: { $ref: '#/components/responses/404' }
 */
router.get('/', listArtisans);
router.get('/:slug', getArtisanBySlug);

export default router;
