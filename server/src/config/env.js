import 'dotenv/config';

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  return value;
}

export const env = {
  nodeEnv: required('NODE_ENV', 'development'),
  port: Number(required('PORT', 5000)),
  frontUrl: required('FRONT_URL', 'http://localhost:5173'),
  mongoUri: required('MONGO_URI', ''),
  jwtSecret: required('JWT_SECRET', ''),
  googleClientId: required('GOOGLE_CLIENT_ID', ''),
  contactTo: required('CONTACT_TO', 'contact@servigo.ci'),
  smtpHost: required('SMTP_HOST', 'localhost'),
  smtpPort: Number(required('SMTP_PORT', 1025)),
  // Plafond global de requêtes /api par IP et par minute (anti-abus).
  apiRateMax: Number(required('API_RATE_MAX', 120)),
};
