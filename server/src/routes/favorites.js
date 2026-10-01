import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { listFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /api/favorites:
 *   get:
 *     tags: [Espace client]
 *     summary: Mes artisans mis en favori
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Favoris', schema: { type: object, properties: { ok: {type: boolean}, data: { type: array, items: { $ref: '#/components/schemas/ArtisanProfile' } } } } }
 *       401: { $ref: '#/components/responses/401' }
 *   post:
 *     tags: [Espace client]
 *     summary: Ajouter un favori
 *     description: 'Idempotent : un favori déjà présent renvoie 200.'
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [artisanId]
 *             properties:
 *               artisanId: { type: string, description: 'ObjectId du profil artisan' }
 *     responses:
 *       200: { description: 'Favori enregistré' }
 *       400: { $ref: '#/components/responses/400' }
 *       404: { $ref: '#/components/responses/404' }
 * /api/favorites/{artisanId}:
 *   delete:
 *     tags: [Espace client]
 *     summary: Retirer un favori
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: artisanId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Favori retiré' }
 *       401: { $ref: '#/components/responses/401' }
 */
router.get('/', listFavorites);
router.post('/', addFavorite);
router.delete('/:artisanId', removeFavorite);

export default router;
