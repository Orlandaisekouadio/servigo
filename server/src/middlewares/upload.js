import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';
import { env } from '../config/env.js';

// Racine des fichiers versés : server/uploads/<artisanId>/<32 hex>.<ext>
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const UPLOADS_ROOT = path.join(serverRoot, 'uploads');

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const ALLOWED_LABEL = [...ALLOWED.keys()].join(', ');

// Le nom d'origine est ignoré : le fichier est stocké sous un nom généré,
// ce qui évite path traversal, collisions et caractères exotiques.
// Le dossier vient de req.profile (posé par requireOwnProfile) : chaque artisan
// a son propre sous-dossier.
const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const dir = path.join(UPLOADS_ROOT, String(req.profile?._id ?? 'anon'));
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename(_req, file, cb) {
    const ext = ALLOWED.get(file.mimetype) ?? '.bin';
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED.has(file.mimetype)) {
    const err = new Error(
      `Format non supporté (${file.mimetype}). Formats acceptés : ${ALLOWED_LABEL}.`,
    );
    err.status = 400;
    return cb(err);
  }
  return cb(null, true);
}

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
}).single('file');

// Erreurs multer traduites en réponses JSON lisibles.
export function uploadErrorHandler(err, _req, res, next) {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      ok: false,
      message: `Fichier trop volumineux (5 Mo maximum).`,
    });
  }
  if (err?.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ ok: false, message: 'Un seul fichier est attendu (champ « file »).' });
  }
  if (err?.status === 400) {
    return res.status(400).json({ ok: false, message: err.message });
  }
  return next(err);
}

export function removeUpload(url) {
  // Ne supprime que les fichiers sous UPLOADS_ROOT (URL /uploads/...).
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return false;
  const target = path.resolve(serverRoot, '.' + url);
  if (!target.startsWith(UPLOADS_ROOT + path.sep)) return false;
  try {
    fs.unlinkSync(target);
    return true;
  } catch {
    return false;
  }
}

export function ensureUploadsRoot() {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

// URL publique d'un fichier stocké pour un artisan donné.
export function uploadUrl(artisanId, filename) {
  return `/uploads/${artisanId}/${filename}`;
}

const staticUploads = express.static(UPLOADS_ROOT, {
  maxAge: env.nodeEnv === 'production' ? '7d' : 0,
  index: false,
  dotfiles: 'deny',
});

// Helmet pose Cross-Origin-Resource-Policy: same-origin sur toutes les réponses,
// ce qui empêcherait le front (:5173) d'afficher les images servies par l'API.
// L'en-tête est réécrit explicitement, sur la seule route /uploads.
export function uploadsStatic(req, res, next) {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  return staticUploads(req, res, next);
}
