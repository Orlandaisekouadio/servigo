import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.join(here, '..', 'routes');

const COMPONENTS = {
  securitySchemes: {
    cookieAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'servigo_token',
      description: 'Cookie httpOnly posé à la connexion. Le Bearer est aussi accepté.',
    },
  },
  schemas: {
    Error: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string' },
        details: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
      },
    },
    User: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        role: { type: 'string', enum: ['client', 'artisan', 'admin'] },
        commune: { type: 'string' },
        specialite: { type: 'string' },
        avatarUrl: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    Service: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        imageUrl: { type: 'string' },
        icon: { type: 'string' },
        active: { type: 'boolean' },
      },
    },
    ArtisanProfile: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        slug: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        avatarUrl: { type: 'string' },
        coverUrl: { type: 'string' },
        location: { type: 'string' },
        commune: { type: 'string' },
        services: { type: 'array', items: { $ref: '#/components/schemas/Service' } },
        rating: { type: 'number', example: 4.6 },
        reviewsCount: { type: 'integer' },
        verified: { type: 'boolean' },
        available: { type: 'boolean' },
        availableLabel: { type: 'string' },
        phone: { type: 'string' },
        whatsapp: { type: 'string' },
        paymentMeans: { type: 'array', items: { type: 'string' } },
        bio: { type: 'string' },
      },
    },
  },
};

const RESPONSES = {
  400: { description: 'Requête invalide', schema: { $ref: '#/components/schemas/Error' } },
  401: { description: 'Non authentifié ou session révoquée', schema: { $ref: '#/components/schemas/Error' } },
  403: { description: 'Accès interdit', schema: { $ref: '#/components/schemas/Error' } },
  404: { description: 'Introuvable', schema: { $ref: '#/components/schemas/Error' } },
  409: { description: 'Conflit (doublon, déjà existant)', schema: { $ref: '#/components/schemas/Error' } },
  429: { description: 'Trop de tentatives' },
};

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'API ServiGo',
    version: '0.1.0',
    description:
      "Back-office du marketplace ServiGo. Authentification par cookie httpOnly `servigo_token` (Bearer accepté en repli). Rôles : `client` (peut noter et mettre en favori), `artisan` (espace personnel), `admin` (back-office). ServiGo facilite la découverte et la mise en relation ; il ne gère pas la prestation elle-même : aucun devis, aucun paiement, aucun historique de contacts.",
  },
  servers: [{ url: `http://localhost:${env.port}`, description: 'Local' }],
  components: { ...COMPONENTS, responses: RESPONSES },
  // Déclaré hors src/routes (monté directement dans app.js) : il échappe au
  // scan de swagger-jsdoc, on le décrit donc à la main.
  paths: {
    '/api/health': {
      get: {
        tags: ['Admin'],
        summary: 'État du service',
        description: 'Sonde de disponibilité. `db` vaut `disconnected` si la connexion Mongo n’est pas encore établie.',
        responses: {
          200: {
            description: 'Service joignable',
            schema: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
                service: { type: 'string', example: 'servigo-server' },
                env: { type: 'string' },
                db: { type: 'string', enum: ['connected', 'disconnected', 'connecting', 'disconnecting', 'unknown'] },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Inscription, connexion, Google, mot de passe' },
    { name: 'Catalogue', description: 'Services, référentiels, artisans publics' },
    { name: 'Espace artisan', description: 'Profil, zones, galerie, statistiques' },
    { name: 'Espace client', description: 'Favoris, avis laissés' },
    { name: 'Contact', description: 'Formulaire du site' },
    { name: 'Admin', description: 'Back-office (rôle admin)' },
  ],
};

export function buildOpenApiSpec() {
  // Les annotations vivent à côté des routes ; une seule passe de scan suffit.
  const files = fs.readdirSync(routesDir).filter((f) => f.endsWith('.js')).map((f) => path.join(routesDir, f));
  return swaggerJsdoc({ definition, apis: files });
}
