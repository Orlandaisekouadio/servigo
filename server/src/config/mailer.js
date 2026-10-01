import nodemailer from 'nodemailer';
import { env } from './env.js';

// Transport SMTP paresseux : aucun réseau tant qu'un envoi n'est pas demandé.
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      // Mailpit / Postfix en local : pas de TLS, ni auth.
      ignoreTLS: env.nodeEnv !== 'production',
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

export async function verifyMailer() {
  await getTransporter().verify();
  return true;
}

function sanitizeHeader(value) {
  // Empêche l'injection CRLF dans les en-têtes (nom du visiteur).
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

export async function sendContactMessage({ name, email, subject, message }) {
  const from = `"ServiGo" <no-reply@servigo.ci>`;
  const body = [
    'Nouveau message depuis le formulaire de contact servigo.ci',
    '',
    `Nom      : ${name}`,
    `Email    : ${email}`,
    `Sujet    : ${subject}`,
    '',
    '--- Message ---',
    message,
  ].join('\n');

  return getTransporter().sendMail({
    from,
    to: env.contactTo,
    replyTo: email,
    subject: `[Contact · ${subject}] ${sanitizeHeader(name)}`,
    text: body,
  });
}

export function passwordResetLink(token) {
  return `${env.frontUrl.replace(/\/$/, '')}/reinitialiser-mdp?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordReset({ name, email, link, ttlMinutes = 60 }) {
  const body = [
    `Bonjour ${name},`,
    '',
    'Une réinitialisation de mot de passe a été demandée pour votre compte ServiGo.',
    'Si vous n\'êtes pas à l\'origine de cette demande, ignorez ce message :',
    'votre mot de passe actuel reste valable.',
    '',
    `Pour choisir un nouveau mot de passe (lien valable ${ttlMinutes} minutes) :`,
    link,
    '',
    '— L\'équipe ServiGo',
  ].join('\n');

  return getTransporter().sendMail({
    from: '"ServiGo" <no-reply@servigo.ci>',
    to: email,
    subject: 'Réinitialisation de votre mot de passe ServiGo',
    text: body,
  });
}
