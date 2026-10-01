import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { dbStatus } from './config/db.js';
import { buildOpenApiSpec } from './config/swagger.js';
import authRoutes from './routes/auth.js';
import artisanRoutes from './routes/artisans.js';
import serviceRoutes, { referentialsRouter } from './routes/services.js';
import favoriteRoutes from './routes/favorites.js';
import reviewRoutes from './routes/reviews.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import { uploadsStatic, ensureUploadsRoot } from './middlewares/upload.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.frontUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan('dev'));

  // Fichiers versés par les artisans (stockage local, hors /api).
  ensureUploadsRoot();
  app.use('/uploads', uploadsStatic);

  app.use(
    '/api/',
    rateLimit({
      windowMs: 60_000,
      max: env.apiRateMax,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'servigo-server', env: env.nodeEnv, db: dbStatus() });
  });

  // Documentation interactive : uniquement hors production (elle décrit toute
  // la surface d'attaque, y compris les routes admin).
  if (env.nodeEnv !== 'production') {
    const spec = buildOpenApiSpec();
    app.get('/api/docs.json', (_req, res) => res.json(spec));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'API ServiGo' }));
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/artisans', artisanRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/referentials', referentialsRouter());
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/api', notFoundHandler());

  app.use(errorHandler({ nodeEnv: env.nodeEnv }));

  return app;
}
