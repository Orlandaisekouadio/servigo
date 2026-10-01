// Gestionnaire d'erreurs terminal. Isolé dans son propre module pour être
// testable : en production, une 5xx ne doit jamais laisser fuir un message
// technique (message Mongo, chemin de fichier, trace d'exécution).

/**
 * @param {{ nodeEnv?: string }} [options]
 * @returns {import('express').ErrorRequestHandler}
 */
export function errorHandler(options = {}) {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  return (err, req, res, next) => {
    const status = err.status ?? err.statusCode ?? 500;
    const isServerFault = status >= 500;

    // Le contrôleur a déjà répondu puis a appelé next(err) : on ne peut plus
    // rien écrire, on rend la main à Express qui fermera la requête.
    if (res.headersSent) return next(err);

    // Côté serveur on journalise toujours ; côté client on ne divulgue rien.
    if (isServerFault) {
      console.error('[api]', req.method, req.originalUrl, err);
    }

    const payload = {
      ok: false,
      message: isServerFault && isProduction ? 'Erreur interne.' : (err.message ?? 'Erreur interne.'),
    };

    // Une erreur de validation 4xx porte déjà un détail structuré et sûr.
    if (!isServerFault && err.details) payload.details = err.details;
    // La trace n'est utile qu'en développement.
    if (isServerFault && !isProduction && err.stack) payload.details = { stack: err.stack };

    return res.status(status).json(payload);
  };
}

/**
 * 404 pour toute route d'API inconnue. Doit être monté après le routeur
 * principal mais avant le gestionnaire d'erreurs.
 */
export function notFoundHandler() {
  return (_req, res) => res.status(404).json({ ok: false, message: 'Ressource introuvable.' });
}