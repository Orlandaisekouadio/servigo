import { Router } from 'express';
import { Service } from '../models/Service.js';
import { COMMUNES } from '../config/referentials.js';

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
 * /api/referentials:
 *   get:
 *     tags: [Catalogue]
 *     summary: Listes de référence (communes)
 *     responses:
 *       200: { description: 'Communes', schema: { type: object, properties: { ok: {type: boolean}, data: { type: object, properties: { communes: { type: array, items: { type: string } } } } } } }
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

// Référentiels statiques — GET /api/referentials (communes)
export function referentialsRouter() {
  const r = Router();
  r.get('/', (_req, res) => res.json({ ok: true, data: { communes: COMMUNES } }));
  return r;
}

export default router;
