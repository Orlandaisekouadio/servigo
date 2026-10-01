import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  google,
  logout,
  me,
  updateMe,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import {
  forgotPassword,
  checkResetToken,
  resetPassword,
} from '../controllers/passwordController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Changements de mot de passe : 5 par heure, pour contrer le piratage en force.
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Trop de tentatives. Réessayez plus tard.' },
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Créer un compte (email + téléphone, ou téléphone seul)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, password, commune, phone]
 *             properties:
 *               name: { type: string, minLength: 2, example: 'Awa NGuessan' }
 *               password: { type: string, minLength: 8, example: 'Motdepasse5!' }
 *               commune: { type: string, example: 'Cocody' }
 *               phone: { type: string, pattern: '^0\\d{9}$', example: '0700000089' }
 *               email: { type: string, format: 'email' }
 *               role: { type: string, enum: [client, artisan], default: client }
 *               specialite: { type: string, description: 'Obligatoire si role = artisan' }
 *     responses:
 *       201: { description: 'Compte créé, cookie posé', schema: { type: object, properties: { ok: {type: boolean}, user: { $ref: '#/components/schemas/User' } } } }
 *       400: { $ref: '#/components/responses/400' }
 *       409: { $ref: '#/components/responses/409' }
 *       429: { description: 'Trop de tentatives' }
 */
router.post('/register', authLimiter, register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Se connecter par email ou téléphone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier: { type: string, description: 'Email ou téléphone' }
 *               password: { type: string }
 *     responses:
 *       200: { description: 'Connecté, cookie posé', schema: { type: object, properties: { ok: {type: boolean}, user: { $ref: '#/components/schemas/User' } } } }
 *       401: { $ref: '#/components/responses/401' }
 *       429: { description: 'Trop de tentatives' }
 */
router.post('/login', authLimiter, login);

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion Google (idToken fourni par le front via GIS)
 *     description: |
 *       Le `idToken` est vérifié par signature et audience. À la première
 *       connexion, un compte est créé avec l'email Google ; ensuite le compte
 *       existant est relié. Renvoie 501 si `GOOGLE_CLIENT_ID` n'est pas configuré.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken: { type: string }
 *               role: { type: string, enum: [client, artisan], description: 'Rôle à la création' }
 *     responses:
 *       200: { description: 'Connecté', schema: { type: object, properties: { ok: {type: boolean}, user: { $ref: '#/components/schemas/User' } } } }
 *       401: { $ref: '#/components/responses/401' }
 *       501: { description: 'GOOGLE_CLIENT_ID absent', schema: { $ref: '#/components/schemas/Error' } }
 */
router.post('/google', authLimiter, google);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Déposer le cookie de session
 *     responses:
 *       200: { description: 'Déconnecté' }
 */
router.post('/logout', logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Compte connecté
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: 'Compte', schema: { type: object, properties: { ok: {type: boolean}, user: { $ref: '#/components/schemas/User' } } } }
 *       401: { $ref: '#/components/responses/401' }
 *   patch:
 *     tags: [Auth]
 *     summary: Modifier son compte
 *     description: |
 *       Seuls `name` et `commune` sont modifiables : email et téléphone sont des
 *       identifiants de connexion, leur changement passe par l'admin. Une
 *       modification du nom est propagée au profil artisan lié.
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2 }
 *               commune: { type: string }
 *     responses:
 *       200: { description: 'Mis à jour' }
 *       400: { $ref: '#/components/responses/400' }
 *       401: { $ref: '#/components/responses/401' }
 */
router.get('/me', protect, me);
router.patch('/me', protect, updateMe);

/**
 * @openapi
 * /api/auth/me/password:
 *   post:
 *     tags: [Auth]
 *     summary: Changer son mot de passe
 *     description: |
 *       Révoque toutes les sessions déjà émises (autres appareils) et renvoie un
 *       nouveau cookie pour l'appelant, qui reste donc connecté. 5 par heure.
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: 'Mot de passe mis à jour' }
 *       400: { $ref: '#/components/responses/400' }
 *       401: { $ref: '#/components/responses/401' }
 */
router.post('/me/password', protect, passwordLimiter, changePassword);

// Demande de lien : chaque appel peut déclencher un envoi d'email, d'où un
// plafond propre, distinct du changement de mot de passe.
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Trop de demandes. Réessayez plus tard.' },
});

// Consommation du token : bornée elle aussi, même si deviner un token de
// 256 bits est déjà hors de portée d'un forceur.
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Trop de tentatives. Réessayez plus tard.' },
});

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Demander un lien de réinitialisation
 *     description: |
 *       Réponse et délai identiques que le compte existe ou non (pas
 *       d'énumération de comptes) : sans adresse email, aucun message n'est
 *       envoyé. Un seul lien valide à la fois. 5 par heure et par IP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier]
 *             properties:
 *               identifier: { type: string, description: 'Email ou téléphone' }
 *     responses:
 *       200: { description: 'Demande traitée' }
 *       400: { $ref: '#/components/responses/400' }
 *       429: { description: 'Trop de demandes' }
 */
router.post('/forgot-password', forgotLimiter, forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   get:
 *     tags: [Auth]
 *     summary: Vérifier la validité d'un lien avant d'afficher le formulaire
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 'Lien valide', schema: { type: object, properties: { ok: {type: boolean}, email: { type: string, nullable: true } } } }
 *       400: { $ref: '#/components/responses/400' }
 *   post:
 *     tags: [Auth]
 *     summary: Choisir un nouveau mot de passe
 *     description: |
 *       Le token est à usage unique et expire au bout d'une heure. Sa valeur en
 *       clair n'est jamais stockée : seul son SHA-256 l'est. Le changement
 *       révoque les sessions en cours.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: 'Mot de passe mis à jour' }
 *       400: { $ref: '#/components/responses/400' }
 *       429: { description: 'Trop de tentatives' }
 */
router.get('/reset-password', checkResetToken);
router.post('/reset-password', resetLimiter, resetPassword);

export default router;
