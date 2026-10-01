import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

const app = createApp();

try {
  await connectDb(env.mongoUri);
} catch (err) {
  console.error('[db] Échec connexion MongoDB :', err.message);
  if (env.nodeEnv === 'production') process.exit(1);
}

app.listen(env.port, () => {
  console.log(`[server] ServiGo API sur http://localhost:${env.port} (${env.nodeEnv})`);
});
