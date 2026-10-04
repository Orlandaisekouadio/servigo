import { Router } from 'express';
import { Service } from '../models/Service.js';
import { Commune } from '../models/Commune.js';

const router = Router();

// Catalogue des services (métiers) — GET /api/services
// Les services désactivés par l'admin restent en base (des profils les
// référencent) mais disparaissent du catalogue public.
/**
 * @openapi
 * /api/services:
 *   get:
 *     tags: [Catalogue]
 *     summary: Catalogue des métiers
 *     description: 'Les services désactivés par l''admin en sont exclus.'
 *     responses:
 *       200: { description: 'Métiers', schema: { type: object, properties: { ok: {type: boolean}, data: { type: array, items: { $ref: '#/components/schemas/Service' } } } } }
 * /api/services/{slug}:
 *   get:
 *     tags: [Catalogue]
 *     summary: Un métier par son slug
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 'Métier', schema: { type: object, properties: { ok: {type: boolean}, data: { $ref: '#/components/schemas/Service' } } } }
 *       404: { $ref: '#/components/responses/404' }
 */
router.get('/', async (_req, res, next) => {
  try {
    const data = await Service.find({ active: { $ne: false } }).sort({ name: 1 }).lean();
    return res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const svc = await Service.findOne({ slug: req.params.slug, active: { $ne: false } }).lean();
    if (!svc) return res.status(404).json({ ok: false, message: 'Service introuvable.' });
    return res.json({ ok: true, data: svc });
  } catch (err) {
    next(err);
  }
});

// Catalogue des communes — GET /api/communes
// Source unique des listes déroulantes (inscription, recherche). Géré par
// l'admin comme Service : ajouter une commune ne demande pas de déploiement.
/**
 * @openapi
 * /api/communes:
 *   get:
 *     tags: [Catalogue]
 *     summary: Catalogue des communes desservies
 *     description: 'Les communes désactivées par l''admin en sont exclues.'
 *     responses:
 *       200: { description: 'Communes', schema: { type: object, properties: { ok: {type: boolean}, data: { type: array, items: { $ref: '#/components/schemas/Commune' } } } } }
 */
export function communesRouter() {
  const r = Router();
  r.get('/', async (_req, res, next) => {
    try {
      const data = await Commune.find({ active: { $ne: false } })
        .sort({ position: 1, name: 1 })
        .select('name position')
        .lean();
      return res.json({ ok: true, data, total: data.length });
    } catch (err) {
      next(err);
    }
  });
  return r;
}

export default router;