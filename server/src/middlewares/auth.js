import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const COOKIE = 'servigo_token';

function getSecret() {
  if (!env.jwtSecret) {
    if (env.nodeEnv === 'production') throw new Error('JWT_SECRET manquant.');
    return 'dev-secret-change-me';
  }
  return env.jwtSecret;
}

// Horodatage de révocation des sessions, arrondi à la seconde : le `iat` d'un
// JWT est en secondes, et sans cet arrondi un jeton émis dans la même seconde
// qu'un changement de mot de passe serait rejeté à tort.
export function revocationStamp() {
  return new Date(Math.floor(Date.now() / 1000) * 1000);
}

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, getSecret(), {
    expiresIn: '7d',
  });
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 3600 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

function readToken(req) {
  if (req.cookies?.[COOKIE]) return req.cookies[COOKIE];
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export async function protect(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ ok: false, message: 'Non authentifié.' });
    const payload = jwt.verify(token, getSecret());
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ ok: false, message: 'Session invalide.' });
    // Session émise avant le dernier changement de mot de passe : révoquée.
    // passwordChangedAt est arrondi à la seconde (revocationStamp), donc un
    // jeton émis dans la même seconde que le changement reste valable.
    if (user.passwordChangedAt && payload.iat < user.passwordChangedAt.getTime() / 1000) {
      return res.status(401).json({ ok: false, message: 'Mot de passe modifié, reconnectez-vous.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Session expirée ou invalide.' });
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: 'Accès interdit.' });
    }
    next();
  };
}
