import { AdminAction } from '../models/AdminAction.js';

// Trace une mutation d'administration. Un échec d'écriture ne doit jamais faire
// échouer l'action métier : l'erreur est loguée, l'action suit son cours.
export async function audit(req, action, targetType, targetId, details = {}) {
  try {
    await AdminAction.create({
      actor: req.user._id,
      action,
      targetType,
      targetId: targetId ?? null,
      details,
    });
  } catch (err) {
    console.error('[audit] écriture impossible :', err.message);
  }
}
