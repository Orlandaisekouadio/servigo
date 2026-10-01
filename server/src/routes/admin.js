import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.js';
import {
  getStats,
  listServices,
  createService,
  updateService,
  deleteService,
  listArtisans,
  getArtisan,
  updateArtisan,
  listReviews,
  deleteReview,
  listUsers,
  getUser,
  updateUser,
  sendUserReset,
  listLog,
} from '../controllers/adminController.js';

const router = Router();

// Tout le back-office est réservé au rôle admin.
router.use(protect, restrictTo('admin'));

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Chiffres du back-office
 *     description: 'Uniquement des données mesurables : volumes, file de validation, comptes actifs.'
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Statistiques' }
 *       403: { $ref: '#/components/responses/403' }
 * /api/admin/services:
 *   get:
 *     tags: [Admin]
 *     summary: Tous les métiers, inactifs compris
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Métiers' }
 *   post:
 *     tags: [Admin]
 *     summary: Créer un métier
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               imageUrl: { type: string }
 *               icon: { type: string }
 *     responses:
 *       201: { description: 'Métier créé' }
 *       400: { $ref: '#/components/responses/400' }
 *       409: { $ref: '#/components/responses/409' }
 * /api/admin/services/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Modifier un métier
 *     description: 'Le `slug` est immuable. Corps vide refusé.'
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
 *               name: { type: string }
 *               description: { type: string }
 *               imageUrl: { type: string }
 *               icon: { type: string }
 *               active: { type: boolean }
 *     responses:
 *       200: { description: 'Mis à jour' }
 *       400: { $ref: '#/components/responses/400' }
 *       404: { $ref: '#/components/responses/404' }
 *   delete:
 *     tags: [Admin]
 *     summary: Retirer un métier du catalogue
 *     description: '409 s''il est référencé par un profil ; sinon il est désactivé (soft delete) et disparaît du catalogue public.'
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Métier désactivé' }
 *       404: { $ref: '#/components/responses/404' }
 *       409: { $ref: '#/components/responses/409' }
 * /api/admin/artisans:
 *   get:
 *     tags: [Admin]
 *     summary: File de validation des profils
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [all, pending, verified, hidden], default: all } }
 *       - { in: query, name: q, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       200: { description: 'Page de profils' }
 *       403: { $ref: '#/components/responses/403' }
 * /api/admin/artisans/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Détail d'un profil artisan
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Profil' }
 *       404: { $ref: '#/components/responses/404' }
 *   patch:
 *     tags: [Admin]
 *     summary: Valider, masquer ou corriger un profil
 *     description: |
 *       `verified` déclenche la validation. `hidden` retire le profil de la
 *       vitrine, des recherches et de la fiche publique (aucun artisan n'est
 *       jamais supprimé). `ratingBase`/`reviewsBase` ajustent la base vitrine et
 *       déclenchent un recalcul de la note. Un admin ne peut pas retirer son
 *       propre rôle.
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
 *               verified: { type: boolean }
 *               hidden: { type: boolean }
 *               available: { type: boolean }
 *               availableLabel: { type: string }
 *               bio: { type: string }
 *               name: { type: string, description: 'Propagé au compte User lié' }
 *               ratingBase: { type: number, minimum: 0, maximum: 5 }
 *               reviewsBase: { type: integer, minimum: 0 }
 *               services: { type: array, items: { type: string }, description: 'Slugs des métiers' }
 *     responses:
 *       200: { description: 'Mis à jour' }
 *       400: { $ref: '#/components/responses/400' }
 *       404: { $ref: '#/components/responses/404' }
 * /api/admin/reviews:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des avis (modération)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: q, schema: { type: string } }
 *       - { in: query, name: rating, schema: { type: integer, minimum: 1, maximum: 5 } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       200: { description: 'Page d''avis' }
 * /api/admin/reviews/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Supprimer un avis abusif
 *     description: 'La note du profil est recalculée.'
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Avis supprimé' }
 *       404: { $ref: '#/components/responses/404' }
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des comptes
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: q, schema: { type: string } }
 *       - { in: query, name: role, schema: { type: string, enum: [client, artisan, admin] } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       200: { description: 'Page de comptes' }
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Détail d'un compte
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Compte' }
 *       404: { $ref: '#/components/responses/404' }
 *   patch:
 *     tags: [Admin]
 *     summary: Modifier un compte (rôle, email, téléphone, nom)
 *     description: 'Email/téléphone : contrôle d''unicité (409). Impossible de retirer son propre rôle admin.'
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
 *               role: { type: string, enum: [client, artisan, admin] }
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               commune: { type: string }
 *               specialite: { type: string }
 *     responses:
 *       200: { description: 'Mis à jour' }
 *       400: { $ref: '#/components/responses/400' }
 *       404: { $ref: '#/components/responses/404' }
 *       409: { $ref: '#/components/responses/409' }
 * /api/admin/users/{id}/reset-link:
 *   post:
 *     tags: [Admin]
 *     summary: Envoyer un lien de réinitialisation à un compte
 *     description: 'Nécessite que le compte possède un email. Lien à usage unique, valable 1 h.'
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Lien envoyé' }
 *       400: { $ref: '#/components/responses/400' }
 *       404: { $ref: '#/components/responses/404' }
 * /api/admin/log:
 *   get:
 *     tags: [Admin]
 *     summary: Journal d'audit (écriture seule)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: q, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       200: { description: 'Journal' }
 */
router.get('/stats', getStats);

// Catalogue des métiers
router.get('/services', listServices);
router.post('/services', createService);
router.patch('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Validation et modération des profils
router.get('/artisans', listArtisans);
router.get('/artisans/:id', getArtisan);
router.patch('/artisans/:id', updateArtisan);

// Modération des avis
router.get('/reviews', listReviews);
router.delete('/reviews/:id', deleteReview);

// Comptes
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.post('/users/:id/reset-link', sendUserReset);

// Journal d'audit
router.get('/log', listLog);

export default router;
