import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getMyProfile,
  updateMyProfile,
  listZones,
  createZone,
  updateZone,
  deleteZone,
  listGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadImage,
  getMyStats,
  uploadSingle,
  uploadErrorHandler,
} from '../controllers/workspaceController.js';

const router = Router();

// Anti-abus sur lesversements : 20 fichiers / 10 min par IP.
const uploadLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Trop de fichiers envoyés. Réessayez dans quelques minutes.' },
});

// Les middlewares d'authentification sont posés en amont par routes/artisans.js
// (protect + restrictTo('artisan','admin') + requireOwnProfile).

/**
 * @openapi
 * /api/artisans/me:
 *   get:
 *     tags: [Espace artisan]
 *     summary: Mon profil d'artisan
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Profil', schema: { type: object, properties: { ok: {type: boolean}, data: { $ref: '#/components/schemas/ArtisanProfile' } } } }
 *       401: { $ref: '#/components/responses/401' }
 *       403: { $ref: '#/components/responses/403' }
 *       404: { description: 'Aucun profil artisan pour ce compte' }
 *   patch:
 *     tags: [Espace artisan]
 *     summary: Modifier mon profil
 *     description: 'Champs modifiables : bio, zone, commune, téléphone, disponibilité, moyens de paiement, services.'
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ArtisanProfile' }
 *     responses:
 *       200: { description: 'Mis à jour' }
 *       400: { $ref: '#/components/responses/400' }
 * /api/artisans/me/stats:
 *   get:
 *     tags: [Espace artisan]
 *     summary: Mes statistiques
 *     description: 'Compteurs réels (avis, note moyenne, répartition des notes, avis par métier). Aucun chiffre estimé.'
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Statistiques' }
 *       401: { $ref: '#/components/responses/401' }
 * /api/artisans/me/zones:
 *   get:
 *     tags: [Espace artisan]
 *     summary: Mes zones d'intervention
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Zones' }
 *   post:
 *     tags: [Espace artisan]
 *     summary: Ajouter une zone
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [commune]
 *             properties:
 *               commune: { type: string }
 *               quartier: { type: string }
 *     responses:
 *       201: { description: 'Zone ajoutée' }
 *       400: { $ref: '#/components/responses/400' }
 * /api/artisans/me/zones/{id}:
 *   patch:
 *     tags: [Espace artisan]
 *     summary: Modifier une zone
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commune: { type: string }
 *               quartier: { type: string }
 *     responses:
 *       200: { description: 'Zone mise à jour' }
 *       404: { $ref: '#/components/responses/404' }
 *   delete:
 *     tags: [Espace artisan]
 *     summary: Supprimer une zone
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Zone supprimée' }
 *       404: { $ref: '#/components/responses/404' }
 * /api/artisans/me/gallery:
 *   get:
 *     tags: [Espace artisan]
 *     summary: Ma galerie photo
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Photos' }
 *   post:
 *     tags: [Espace artisan]
 *     summary: Ajouter une photo
 *     description: 'multipart/form-data, champ `file`. JPG/PNG/WebP, 4 Mo max. 20 fichiers / 10 min.'
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               caption: { type: string }
 *     responses:
 *       201: { description: 'Photo ajoutée' }
 *       400: { $ref: '#/components/responses/400' }
 *       429: { $ref: '#/components/responses/429' }
 * /api/artisans/me/gallery/{id}:
 *   patch:
 *     tags: [Espace artisan]
 *     summary: Modifier une photo (légende)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caption: { type: string }
 *     responses:
 *       200: { description: 'Photo mise à jour' }
 *       404: { $ref: '#/components/responses/404' }
 *   delete:
 *     tags: [Espace artisan]
 *     summary: Supprimer une photo
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Photo supprimée' }
 *       404: { $ref: '#/components/responses/404' }
 * /api/artisans/me/avatar:
 *   post:
 *     tags: [Espace artisan]
 *     summary: Changer ma photo de profil
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: 'Avatar mis à jour' }
 *       400: { $ref: '#/components/responses/400' }
 * /api/artisans/me/cover:
 *   post:
 *     tags: [Espace artisan]
 *     summary: Changer ma bannière
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: 'Bannière mise à jour' }
 *       400: { $ref: '#/components/responses/400' }
 */
router.get('/', getMyProfile);
router.patch('/', updateMyProfile);
router.get('/stats', getMyStats);

router.get('/zones', listZones);
router.post('/zones', createZone);
router.patch('/zones/:id', updateZone);
router.delete('/zones/:id', deleteZone);

router.get('/gallery', listGallery);
router.post(
  '/gallery',
  uploadLimiter,
  uploadSingle,
  uploadErrorHandler,
  createGalleryItem,
);
router.patch('/gallery/:id', updateGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);

// Express 5 ne gère plus les params regex inline : une route par champ.
const uploadFor = (field) => (req, res, next) => uploadImage(field, req, res, next);

router.post('/avatar', uploadLimiter, uploadSingle, uploadErrorHandler, uploadFor('avatarUrl'));
router.post('/cover', uploadLimiter, uploadSingle, uploadErrorHandler, uploadFor('coverUrl'));

export default router;
